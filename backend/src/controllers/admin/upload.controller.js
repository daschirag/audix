const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const multer = require('multer');
const Question = require('../../models/Question');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { HTTP, ROUNDS, UPLOAD } = require('../../config/constants');

// ── MULTER CONFIG ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads/questions'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/json', 'text/csv', 'text/plain'];
  if (allowed.includes(file.mimetype) ||
      file.originalname.endsWith('.csv') ||
      file.originalname.endsWith('.json')) {
    cb(null, true);
  } else {
    cb(new ApiError(HTTP.BAD_REQUEST, 'Only JSON and CSV files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: UPLOAD.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// ── VALIDATE QUESTION OBJECT ───────────────────────────────────────
const validateQuestionData = (q) => {
  const errors = [];
  if (!q.round || q.round < 1 || q.round > ROUNDS.TOTAL)
    errors.push('Invalid round number');
  if (!q.type) errors.push('Type is required');
  if (!q.question) errors.push('Question text is required');
  return errors;
};

// ── BULK UPLOAD JSON ───────────────────────────────────────────────
const bulkUploadJSON = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP.BAD_REQUEST, 'No file uploaded.');
  }

  const filePath = req.file.path;
  let questions;

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    questions = JSON.parse(raw);
  } catch (err) {
    fs.unlinkSync(filePath);
    throw new ApiError(HTTP.BAD_REQUEST, 'Invalid JSON format.');
  }

  fs.unlinkSync(filePath); // Clean up uploaded file

  if (!Array.isArray(questions)) {
    throw new ApiError(HTTP.BAD_REQUEST, 'JSON must be an array of questions.');
  }

  const results = { inserted: 0, failed: 0, errors: [] };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const validationErrors = validateQuestionData(q);

    if (validationErrors.length > 0) {
      results.failed++;
      results.errors.push({ index: i, errors: validationErrors });
      continue;
    }

    try {
      await Question.create({
        round: q.round,
        roundName: ROUNDS.NAMES[q.round - 1],
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctOrder: q.correctOrder || [],
        explanation: q.explanation || '',
        piiFields: q.piiFields || [],
        difficulty: q.difficulty || 'medium',
        imageUrl: q.imageUrl || null,
        createdBy: req.user._id,
      });
      results.inserted++;
    } catch (err) {
      results.failed++;
      results.errors.push({ index: i, error: err.message });
    }
  }

  return res.status(HTTP.CREATED).json(
    new ApiResponse(HTTP.CREATED, results,
      `Bulk upload complete. ${results.inserted} inserted, ${results.failed} failed.`)
  );
});

// ── BULK UPLOAD CSV ────────────────────────────────────────────────
const bulkUploadCSV = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP.BAD_REQUEST, 'No file uploaded.');
  }

  const filePath = req.file.path;
  const questions = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => questions.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  fs.unlinkSync(filePath);

  const results = { inserted: 0, failed: 0, errors: [] };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    // Parse options from CSV format: "optionA|optionB|optionC"
    let options = [];
    if (q.options) {
      const optTexts = q.options.split('|');
      const correctIndex = parseInt(q.correctIndex) || 0;
      options = optTexts.map((text, idx) => ({
        text: text.trim(),
        isCorrect: idx === correctIndex,
      }));
    }

    const parsed = {
      round: parseInt(q.round),
      type: q.type?.trim(),
      question: q.question?.trim(),
      options,
      explanation: q.explanation?.trim() || '',
      difficulty: q.difficulty?.trim() || 'medium',
    };

    const validationErrors = validateQuestionData(parsed);
    if (validationErrors.length > 0) {
      results.failed++;
      results.errors.push({ row: i + 2, errors: validationErrors });
      continue;
    }

    try {
      await Question.create({
        ...parsed,
        roundName: ROUNDS.NAMES[parsed.round - 1],
        createdBy: req.user._id,
      });
      results.inserted++;
    } catch (err) {
      results.failed++;
      results.errors.push({ row: i + 2, error: err.message });
    }
  }

  return res.status(HTTP.CREATED).json(
    new ApiResponse(HTTP.CREATED, results,
      `CSV upload complete. ${results.inserted} inserted, ${results.failed} failed.`)
  );
});

module.exports = { upload, bulkUploadJSON, bulkUploadCSV };