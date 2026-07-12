const express = require('express');
const authRouter = express.Router();
const { register, login, logout, adminRegister } = require('../controllers/auth.controller');
const authMiddleware = require("../middleware/auth.middleware");

// Public Routes
authRouter.post('/register', register);
authRouter.post('/login', login);

// Protected Routes (requires any valid user)
authRouter.post('/logout', authMiddleware(), logout);

// Admin Routes (requires 'admin' role)
authRouter.post('/admin/register', authMiddleware(['admin']), adminRegister);

module.exports = authRouter;
