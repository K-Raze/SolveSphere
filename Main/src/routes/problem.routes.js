const express = require('express');
const problemRouter = express.Router();
const {
    problemCreate,
    problemUpdate,
    problemDelete,
    problemFetch,
    getAllProblem,
    solvedProblem
} = require('../controllers/problem.controller');

// Create, Update, Delete
problemRouter.post("/create", problemCreate);
problemRouter.patch("/:id", problemUpdate);
problemRouter.delete("/:id", problemDelete);

// Fetch
problemRouter.get("/user", solvedProblem);
problemRouter.get("/:id", problemFetch);
problemRouter.get("/", getAllProblem);

module.exports = problemRouter;
