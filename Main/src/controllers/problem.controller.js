const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require('../models/submission');
const { validateReferenceSolution } = require('../utils/judge0');

const problemCreate = async (req, res, next) => {
    try {
        const {
            title, description, difficulty, tags,
            visibleTestCases, hiddenTestCases, startCode,
            referenceSolution,
            company, role, interviewRound, yearAsked, sourceUrl
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
            company,
            role,
            interviewRound,
            yearAsked,
            sourceType: 'admin',
            sourceUrl,
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
            referenceSolution,
            company, role, interviewRound, yearAsked, sourceUrl, frequency
        } = req.body;

        // Re-validate reference solutions if they are being updated
        if (referenceSolution && visibleTestCases) {
            await validateReferenceSolution(referenceSolution, visibleTestCases);
        }

        const updateFields = {};
        // Only include fields that are actually provided
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;
        if (difficulty !== undefined) updateFields.difficulty = difficulty;
        if (tags !== undefined) updateFields.tags = tags;
        if (visibleTestCases !== undefined) updateFields.visibleTestCases = visibleTestCases;
        if (hiddenTestCases !== undefined) updateFields.hiddenTestCases = hiddenTestCases;
        if (startCode !== undefined) updateFields.startCode = startCode;
        if (referenceSolution !== undefined) updateFields.referenceSolution = referenceSolution;
        if (company !== undefined) updateFields.company = company;
        if (role !== undefined) updateFields.role = role;
        if (interviewRound !== undefined) updateFields.interviewRound = interviewRound;
        if (yearAsked !== undefined) updateFields.yearAsked = yearAsked;
        if (sourceUrl !== undefined) updateFields.sourceUrl = sourceUrl;
        if (frequency !== undefined) updateFields.frequency = frequency;

        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            updateFields,
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

        const query = { _id: id };
        // Non-admin users can only see approved problems
        if (req.user.role !== 'admin') {
            query.status = 'approved';
        }

        const problem = await Problem.findOne(query)
            .select('-hiddenTestCases -referenceSolution');
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
        const {
            difficulty, company, tags, interviewRound, yearAsked,
            search, sort, page = 1, limit = 20
        } = req.query;

        // Build filter — only show approved problems to non-admins
        const filter = {};
        if (req.user.role !== 'admin') {
            filter.status = 'approved';
        }

        if (difficulty) filter.difficulty = difficulty;
        if (company) filter.company = { $in: company.split(',') };
        if (tags) filter.tags = { $in: tags.split(',') };
        if (interviewRound) filter.interviewRound = interviewRound;
        if (yearAsked) filter.yearAsked = parseInt(yearAsked);

        // Text search on title
        if (search) {
            filter.$text = { $search: search };
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // default: newest first
        if (sort === 'frequency') sortOption = { frequency: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'difficulty') sortOption = { difficulty: 1 };

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [problems, total] = await Promise.all([
            Problem.find(filter)
                .select('title difficulty tags company frequency interviewRound yearAsked createdAt')
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum),
            Problem.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: problems,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        next(err);
    }
};

const getSolvedProblems = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "title difficulty tags company"
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.status(200).json({
            success: true,
            data: user.problemSolved
        });
    } catch (err) {
        next(err);
    }
};

const getProblemSubmissions = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;

        const submissions = await Submission.find({ userId, problemId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: submissions.length,
            data: submissions
        });
    } catch (err) {
        next(err);
    }
};

const toggleBookmark = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        const user = await User.findById(userId);
        const isBookmarked = user.bookmarks.includes(problemId);

        if (isBookmarked) {
            await User.findByIdAndUpdate(userId, { $pull: { bookmarks: problemId } });
        } else {
            await User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: problemId } });
        }

        res.status(200).json({
            success: true,
            message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
            data: { bookmarked: !isBookmarked }
        });
    } catch (err) {
        next(err);
    }
};

const getBookmarks = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).populate({
            path: 'bookmarks',
            select: 'title difficulty tags company'
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            data: user.bookmarks
        });
    } catch (err) {
        next(err);
    }
};

const getSmartPOTD = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const solvedProblemIds = user.problemSolved || [];

        // Find a single approved problem the user hasn't solved, sorted by frequency (desc) then randomly (or just newest)
        // MongoDB doesn't have a simple "random" sort without aggregation, so we'll just 
        // sort by frequency and take the first one, meaning they get the most commonly asked 
        // interview question they haven't solved yet.
        const potd = await Problem.findOne({
            status: 'approved',
            _id: { $nin: solvedProblemIds }
        })
        .sort({ frequency: -1, createdAt: -1 }) // most frequent first
        .select('-hiddenTestCases -referenceSolution'); // exclude hidden parts

        if (!potd) {
            // If they solved everything, just return the most frequent problem
            const fallbackPotd = await Problem.findOne({ status: 'approved' })
                .sort({ frequency: -1 })
                .select('-hiddenTestCases -referenceSolution');
            
            return res.status(200).json({
                success: true,
                message: "You have solved all problems! Here is a review problem.",
                data: fallbackPotd
            });
        }

        res.status(200).json({
            success: true,
            message: "Here is your personalized Problem of the Day.",
            data: potd
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
    getAllProblem,
    getSolvedProblems,
    getProblemSubmissions,
    toggleBookmark,
    getBookmarks,
    getSmartPOTD
};
