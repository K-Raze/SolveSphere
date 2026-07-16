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
    analyzeSubmission,
    getPublicExperiences,
    getExperienceById
} = require('../controllers/experience.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes (Viewing experiences)
experienceRouter.get('/', getPublicExperiences);
experienceRouter.get('/:id', getExperienceById);

// User routes (Requires login)
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
