const express = require('express');
const discussionRouter = express.Router();
const { postComment, getComments } = require('../controllers/discussion.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public route to view comments
discussionRouter.get('/:problemId', getComments);

// Protected route to post a comment
discussionRouter.post('/:problemId', authMiddleware(), postComment);

module.exports = discussionRouter;
