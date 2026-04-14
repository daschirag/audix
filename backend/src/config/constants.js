const ROLES = {
  USER:  'user',
  ADMIN: 'admin',
};

const ROUNDS = {
  TOTAL: 6,
  NAMES: [
    'Phishing Inbox Review',
    'Social Engineering Chat',
    'PII Identification',
    'Password Fortress',
    'Secure Browsing',
    'Incident Response',
  ],
  TIME_LIMIT_SECONDS: 90,
  QUESTIONS_PER_ROUND: 5,
};

const SCORING = {
  BASE_SCORE: 100,          // rounds 1-2, 4-6: 100 base + 20 bonus = 120 max/q × 5 = 600/round
  ROUND3_BASE_SCORE: 120,   // round 3 PII: 120 base + 20 bonus = 140 max/q × 5 = 700/round
  EARLY_SUBMIT_BONUS: 20,   // awarded for answering in < 50% of time limit
  WRONG_ANSWER_PENALTY: 0,  // no deduction — just no points awarded
  MAX_SCORE_PER_ROUND: 600,
  ROUND3_MAX_SCORE: 700,
  TOTAL_MAX_SCORE: 3700,    // 5 × 600 + 700 = 3700
};

const STAR_RATING = {
  ONE_STAR:   { min: 0,  max: 33,  title: 'Novice' },
  TWO_STAR:   { min: 34, max: 66,  title: 'Vigilant Protector' },
  THREE_STAR: { min: 67, max: 100, title: 'Cyber Guardian' },
};

const PII_TYPES = ['name', 'email', 'ssn', 'dob', 'address', 'phone'];

const AUTH = {
  BCRYPT_ROUNDS: 12,
  OTP_EXPIRY_MINUTES: 5,
  OTP_MAX_ATTEMPTS: 3,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
};

const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const UPLOAD = {
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_TYPES: ['application/json', 'text/csv'],
  QUESTIONS_POOL_MIN: 20,
  QUESTIONS_POOL_MAX: 50,
};

const SESSION_STATUS = {
  PENDING:    'pending',
  ACTIVE:     'active',
  COMPLETED:  'completed',
  TERMINATED: 'terminated',
  EXPIRED:    'expired',
};

const API = {
  VERSION: process.env.API_VERSION || 'v1',
};

module.exports = {
  ROLES,
  ROUNDS,
  SCORING,
  STAR_RATING,
  PII_TYPES,
  AUTH,
  HTTP,
  UPLOAD,
  SESSION_STATUS,
  API,
};
