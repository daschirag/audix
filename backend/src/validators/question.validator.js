const Joi = require('joi');

const createQuestionSchema = Joi.object({
  round: Joi.number().min(1).max(6).required().messages({
    'number.min': 'Round must be between 1 and 6',
    'number.max': 'Round must be between 1 and 6',
    'any.required': 'Round is required',
  }),
  type: Joi.string()
    .valid('multiple-choice', 'chat-response', 'ordering', 'text-input')
    .required()
    .messages({
      'any.only': 'Type must be one of: multiple-choice, chat-response, ordering, text-input',
      'any.required': 'Question type is required',
    }),
  question: Joi.string().min(5).max(1000).trim().required().messages({
    'string.min': 'Question must be at least 5 characters',
    'any.required': 'Question text is required',
  }),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().trim().required(),
        isCorrect: Joi.boolean().default(false),
      })
    )
    .min(2)
    .max(8)
    .optional(),
  correctOrder: Joi.array().items(Joi.string().trim()).max(10).optional(),
  explanation: Joi.string().max(2000).trim().optional(),
  piiFields: Joi.array().items(Joi.string().trim()).max(20).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  imageUrl: Joi.string().uri().allow('').optional(),
});

const updateQuestionSchema = Joi.object({
  question: Joi.string().min(5).max(1000).trim().optional(),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().trim().required(),
        isCorrect: Joi.boolean(),
      })
    )
    .min(2)
    .max(8)
    .optional(),
  correctOrder: Joi.array().items(Joi.string().trim()).max(10).optional(),
  explanation: Joi.string().max(2000).trim().optional(),
  piiFields: Joi.array().items(Joi.string().trim()).max(20).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  imageUrl: Joi.string().uri().allow('').optional(),
  isActive: Joi.boolean().optional(),
  type: Joi.string()
    .valid('multiple-choice', 'chat-response', 'ordering', 'text-input')
    .optional(),
});

module.exports = { createQuestionSchema, updateQuestionSchema };
