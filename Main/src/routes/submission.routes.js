const express = require('express');
const submissionRouter = express.Router();
const { submitCode, runCode, saveDraft, getDraft } = require('../controllers/submission.controller');
const authMiddleware = require('../middleware/auth.middleware');

submissionRouter.post('/run/:id', authMiddleware(), runCode);
submissionRouter.post('/submit/:id', authMiddleware(), submitCode);

// Code Drafts
submissionRouter.post('/draft/:id', authMiddleware(), saveDraft);
submissionRouter.get('/draft/:id', authMiddleware(), getDraft);

module.exports = submissionRouter;
