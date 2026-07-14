const express = require('express');
const experienceRouter = express.Router();
const {
    submitExperience,
    getMySubmissions,
    getAdminQueue,
    generateProblem,
    approveExperience,
    rejectExperience,
    solveProblemAction,
    analyzeSubmission
} = require('../controllers/experience.controller');
const authMiddleware = require('../middleware/auth.middleware');

// User routes
experienceRouter.post('/analyze', authMiddleware(), analyzeSubmission);
experienceRouter.post('/submit', authMiddleware(), submitExperience);
experienceRouter.get('/my-submissions', authMiddleware(), getMySubmissions);
experienceRouter.post('/:id/solve', authMiddleware(), solveProblemAction);

// Admin routes
experienceRouter.get('/admin/queue', authMiddleware(['admin']), getAdminQueue);
experienceRouter.post('/admin/:id/generate', authMiddleware(['admin']), generateProblem);
experienceRouter.patch('/admin/:id/approve', authMiddleware(['admin']), approveExperience);
experienceRouter.patch('/admin/:id/reject', authMiddleware(['admin']), rejectExperience);

module.exports = experienceRouter;
