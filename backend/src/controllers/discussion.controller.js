const Discussion = require('../models/discussion');
const Problem = require('../models/problem');

const postComment = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.problemId;
        const { content } = req.body;

        if (!content || content.length < 10) {
            return res.status(400).json({ success: false, message: "Comment must be at least 10 characters long" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        const comment = await Discussion.create({
            problemId,
            userId,
            content
        });

        res.status(201).json({
            success: true,
            message: "Comment posted",
            data: comment
        });
    } catch (err) {
        next(err);
    }
};

const getComments = async (req, res, next) => {
    try {
        const problemId = req.params.problemId;

        const comments = await Discussion.find({ problemId })
            .populate('userId', 'username firstName lastName reputation')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { postComment, getComments };
