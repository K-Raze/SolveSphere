const express = require('express');
const submissionRouter = express.Router();
const { submitCode, runCode, saveDraft, getDraft } = require('../controllers/submission.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { createRateLimiter } = require('../middleware/rateLimiter');

// 10-second cooldown to protect Judge0 API
const codeExecutionLimiter = createRateLimiter(10, 'code-execution');

submissionRouter.post('/run/:id', authMiddleware(), codeExecutionLimiter, runCode);
submissionRouter.post('/submit/:id', authMiddleware(), codeExecutionLimiter, submitCode);

// Code Drafts
submissionRouter.post('/draft/:id', authMiddleware(), saveDraft);
submissionRouter.get('/draft/:id', authMiddleware(), getDraft);

module.exports = submissionRouter;
