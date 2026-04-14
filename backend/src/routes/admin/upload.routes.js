const express = require('express');
const router = express.Router();
const { upload, bulkUploadJSON, bulkUploadCSV } = require('../../controllers/admin/upload.controller');
const { verifyJWT, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(verifyJWT, requireAdmin);

router.post('/json', upload.single('file'), bulkUploadJSON);
router.post('/csv',  upload.single('file'), bulkUploadCSV);

module.exports = router;