const Problem = require('../models/problem');
const { validateReferenceSolution } = require('../utils/judge0');

const problemCreate = async (req, res, next) => {
    try {
        const {
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, startCode,
            referenceSolution
        } = req.body;

        if (!title || !description || !difficulty || !referenceSolution || !visibleTestCases) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Validate reference solutions against test cases using Judge0
        await validateReferenceSolution(referenceSolution, visibleTestCases);

        const problem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            problemCreator: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Problem Created Successfully",
            data: { _id: problem._id, title: problem.title }
        });
    } catch (err) {
        next(err);
    }
};

const problemUpdate = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Problem ID is required" });
        }

        const existingProblem = await Problem.findById(id);
        if (!existingProblem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        const {
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, startCode,
            referenceSolution
        } = req.body;

        // Re-validate reference solutions if they are being updated
        if (referenceSolution && visibleTestCases) {
            await validateReferenceSolution(referenceSolution, visibleTestCases);
        }

        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution },
            { runValidators: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: "Problem Updated Successfully",
            data: updatedProblem
        });
    } catch (err) {
        next(err);
    }
};

const problemDelete = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Problem ID is required" });
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        res.status(200).json({
            success: true,
            message: "Problem Deleted Successfully"
        });
    } catch (err) {
        next(err);
    }
};

const problemFetch = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Problem ID is required" });
        }

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        res.status(200).json({
            success: true,
            data: problem
        });
    } catch (err) {
        next(err);
    }
};

const getAllProblem = async (req, res, next) => {
    try {
        const problems = await Problem.find({}).select('title difficulty tags createdAt');

        res.status(200).json({
            success: true,
            count: problems.length,
            data: problems
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    problemCreate,
    problemUpdate,
    problemDelete,
    problemFetch,
    getAllProblem
};
