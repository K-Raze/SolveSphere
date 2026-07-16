const express = require('express');
const problemRouter = express.Router();
const {
    problemCreate,
    problemUpdate,
    problemDelete,
    problemFetch,
    getAllProblem,
    getSolvedProblems,
    getProblemSubmissions,
    toggleBookmark,
    getBookmarks,
    getSmartPOTD
} = require('../controllers/problem.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Admin-only routes (create, update, delete problems)
problemRouter.post("/create", authMiddleware(['admin']), problemCreate);
problemRouter.patch("/:id", authMiddleware(['admin']), problemUpdate);
problemRouter.delete("/:id", authMiddleware(['admin']), problemDelete);

// Authenticated user routes
problemRouter.get("/user/solved", authMiddleware(), getSolvedProblems);
problemRouter.get("/user/bookmarks", authMiddleware(), getBookmarks);
problemRouter.get("/user/submissions/:id", authMiddleware(), getProblemSubmissions);
problemRouter.post("/bookmark/:id", authMiddleware(), toggleBookmark);
problemRouter.get("/smart-potd", authMiddleware(), getSmartPOTD);
problemRouter.get("/:id", authMiddleware(), problemFetch);
problemRouter.get("/", authMiddleware(), getAllProblem);

module.exports = problemRouter;
