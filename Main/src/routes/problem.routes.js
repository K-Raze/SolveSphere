const express = require('express');
const problemRouter = express.Router();
const {
    problemCreate,
    problemUpdate,
    problemDelete,
    problemFetch,
    getAllProblem
} = require('../controllers/problem.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Admin-only routes (create, update, delete problems)
problemRouter.post("/create", authMiddleware(['admin']), problemCreate);
problemRouter.patch("/:id", authMiddleware(['admin']), problemUpdate);
problemRouter.delete("/:id", authMiddleware(['admin']), problemDelete);

// Authenticated user routes (view problems)
problemRouter.get("/:id", authMiddleware(), problemFetch);
problemRouter.get("/", authMiddleware(), getAllProblem);

module.exports = problemRouter;
