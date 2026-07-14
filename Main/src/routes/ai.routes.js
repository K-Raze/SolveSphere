const express = require('express');
const aiRouter = express.Router();
const { getHint, chatInterviewer } = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');

// AI Interview Features
// These routes are protected and require a valid token
aiRouter.post('/hint', authMiddleware(), getHint);
aiRouter.post('/chat', authMiddleware(), chatInterviewer);

module.exports = aiRouter;
