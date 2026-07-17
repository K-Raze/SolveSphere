const express = require('express');
const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile, getPublicProfile, getLeaderboard, getProfile } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public Routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/leaderboard', getLeaderboard);
authRouter.get('/profile/:username', getPublicProfile);

// Protected Routes (requires any valid user)
authRouter.get('/profile', authMiddleware(), getProfile);
authRouter.post('/logout', authMiddleware(), logout);
authRouter.delete('/delete', authMiddleware(), deleteProfile);

// Admin Routes (requires 'admin' role)
authRouter.post('/admin/register', authMiddleware(['admin']), adminRegister);

module.exports = authRouter;
