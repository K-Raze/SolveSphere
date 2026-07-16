const InterviewExperience = require('../models/interviewExperience');
const Problem = require('../models/problem');
const { generateProblemFromExperience } = require('../utils/aiGenerator');

// User submits a new interview experience
const submitExperience = async (req, res, next) => {
    try {
        const { company, role, interviewRound, yearAsked, rawDescription, sourceUrl } = req.body;

        if (!company || !rawDescription) {
            return res.status(400).json({
                success: false,
                message: "Company name and interview description are required"
            });
        }

        if (rawDescription.length < 50) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least 50 characters of detail about the interview question"
            });
        }

        const experience = await InterviewExperience.create({
            submittedBy: req.user._id,
            company: company.toLowerCase().trim(),
            role,
            interviewRound,
            yearAsked,
            rawDescription,
            sourceUrl
        });

        res.status(201).json({
            success: true,
            message: "Interview experience submitted successfully. It will be reviewed by an admin.",
            data: { _id: experience._id, status: experience.status }
        });
    } catch (err) {
        next(err);
    }
};

// User fetches their own submissions
const getMySubmissions = async (req, res, next) => {
    try {
        const experiences = await InterviewExperience.find({ submittedBy: req.user._id })
            .select('company role interviewRound yearAsked status createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: experiences.length,
            data: experiences
        });
    } catch (err) {
        next(err);
    }
};

// Admin: get the review queue (pending and generated experiences)
const getAdminQueue = async (req, res, next) => {
    try {
        const { status = 'pending' } = req.query;

        const experiences = await InterviewExperience.find({ status })
            .populate('submittedBy', 'firstName lastName username')
            .populate('generatedProblemId', 'title difficulty')
            .sort({ createdAt: 1 }); // oldest first so nothing gets stuck

        res.status(200).json({
            success: true,
            count: experiences.length,
            data: experiences
        });
    } catch (err) {
        next(err);
    }
};

// Admin: trigger AI generation for a pending experience
const generateProblem = async (req, res, next) => {
    try {
        const { id } = req.params;

        const experience = await InterviewExperience.findById(id);
        if (!experience) {
            return res.status(404).json({ success: false, message: "Experience not found" });
        }

        if (experience.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot generate: experience is already '${experience.status}'`
            });
        }

        // Mark as processing so it can't be triggered twice
        experience.status = 'processing';
        await experience.save();

        // Call AI to generate structured problem
        let generated;
        try {
            generated = await generateProblemFromExperience(experience);
        } catch (aiError) {
            // If AI fails, revert status so admin can retry
            experience.status = 'pending';
            await experience.save();
            return res.status(502).json({
                success: false,
                message: "AI generation failed: " + aiError.message
            });
        }

        // Create a draft Problem from the AI output
        const problem = await Problem.create({
            title: generated.title,
            description: generated.description,
            difficulty: generated.difficulty,
            tags: generated.tags || [],
            visibleTestCases: generated.visibleTestCases,
            hiddenTestCases: generated.hiddenTestCases || [],
            company: [experience.company],
            role: experience.role,
            interviewRound: experience.interviewRound,
            yearAsked: experience.yearAsked,
            sourceType: 'community',
            sourceUrl: experience.sourceUrl,
            startCode: [],
            referenceSolution: [],
            status: 'pending', // needs admin approval before going public
            problemCreator: req.user._id
        });

        // Link the generated problem back to the experience
        experience.generatedProblemId = problem._id;
        experience.status = 'generated';
        await experience.save();

        res.status(201).json({
            success: true,
            message: "Problem generated successfully. Review it before approving.",
            data: {
                experienceId: experience._id,
                generatedProblem: problem,
                editorial: generated.editorial
            }
        });
    } catch (err) {
        next(err);
    }
};

// Admin: approve a generated problem (makes it public)
const approveExperience = async (req, res, next) => {
    try {
        const { id } = req.params;

        const experience = await InterviewExperience.findById(id);
        if (!experience) {
            return res.status(404).json({ success: false, message: "Experience not found" });
        }

        if (experience.status !== 'generated') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve: experience status is '${experience.status}', expected 'generated'`
            });
        }

        if (!experience.generatedProblemId) {
            return res.status(400).json({
                success: false,
                message: "No generated problem linked to this experience"
            });
        }

        // Update problem status and confidence level
        const problem = await Problem.findById(experience.generatedProblemId);
        if (problem) {
            problem.status = 'approved';
            if (problem.confidenceLevel === 'community-reported') {
                problem.confidenceLevel = 'admin-reviewed';
            } else if (problem.confidenceLevel === 'multiple-reports') {
                problem.confidenceLevel = 'high-confidence';
            }
            await problem.save();
        }

        experience.status = 'approved';
        await experience.save();

        // Increment the submitter's reputation by 50 points
        const User = require('../models/user');
        await User.findByIdAndUpdate(experience.submittedBy, {
            $inc: { reputation: 50 }
        });

        res.status(200).json({
            success: true,
            message: "Problem approved and published!"
        });
    } catch (err) {
        next(err);
    }
};

// Admin: reject an experience with notes
const rejectExperience = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;

        const experience = await InterviewExperience.findById(id);
        if (!experience) {
            return res.status(404).json({ success: false, message: "Experience not found" });
        }

        if (experience.status === 'approved' || experience.status === 'rejected') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject: experience is already '${experience.status}'`
            });
        }

        // If a draft problem was generated, delete it
        if (experience.generatedProblemId) {
            await Problem.findByIdAndDelete(experience.generatedProblemId);
            experience.generatedProblemId = undefined;
        }

        experience.status = 'rejected';
        experience.adminNotes = adminNotes || '';
        await experience.save();

        res.status(200).json({
            success: true,
            message: "Experience rejected"
        });
    } catch (err) {
        next(err);
    }
};

const solveProblemAction = async (req, res, next) => {
    try {
        const { id } = req.params;
        const experience = await InterviewExperience.findById(id);

        if (!experience) {
            return res.status(404).json({ success: false, message: "Experience not found" });
        }

        // Case 1 & 2: Already processed
        if (experience.similarProblemId) {
            return res.status(200).json({ success: true, action: 'solve_existing', problemId: experience.similarProblemId });
        }
        
        if (experience.generatedProblemId) {
            const problem = await Problem.findById(experience.generatedProblemId);
            if (problem && problem.status === 'approved') {
                return res.status(200).json({ success: true, action: 'solve_existing', problemId: problem._id });
            } else {
                return res.status(200).json({ success: true, action: 'wait_for_review', status: problem ? problem.status : 'pending' });
            }
        }

        // Prevent race conditions
        if (experience.status === 'processing') {
            return res.status(200).json({ success: true, action: 'wait_for_review', status: 'processing' });
        }

        experience.status = 'processing';
        await experience.save();

        // Step 1: Text search for similar problems
        // Assuming we created a text index on title and description
        const matches = await Problem.find(
            { $text: { $search: experience.rawDescription } },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } }).limit(5);

        const { detectDuplicateProblem } = require('../utils/aiGenerator');
        const duplicateCheck = await detectDuplicateProblem(experience, matches);

        if (duplicateCheck.isDuplicate && duplicateCheck.problemId) {
            const matchedProblem = await Problem.findById(duplicateCheck.problemId);
            
            if (matchedProblem) {
                // It's a duplicate! Update existing problem.
                matchedProblem.frequency += 1;
                matchedProblem.reports.push({
                    experienceId: experience._id,
                    submittedBy: experience.submittedBy
                });

                if (matchedProblem.reports.length >= 3) {
                    matchedProblem.confidenceLevel = 'high-confidence';
                } else if (matchedProblem.reports.length >= 1 && matchedProblem.confidenceLevel === 'community-reported') {
                    matchedProblem.confidenceLevel = 'multiple-reports';
                }

                await matchedProblem.save();

                experience.similarProblemId = matchedProblem._id;
                experience.status = 'approved';
                await experience.save();

                return res.status(200).json({ success: true, action: 'solve_existing', problemId: matchedProblem._id });
            }
        }

        // Case 3: No duplicate found. Generate new problem.
        const { generateProblemFromExperience } = require('../utils/aiGenerator');
        const generated = await generateProblemFromExperience(experience);

        const newProblem = await Problem.create({
            title: generated.title,
            description: generated.description,
            difficulty: generated.difficulty,
            tags: generated.tags || [],
            visibleTestCases: generated.visibleTestCases,
            hiddenTestCases: generated.hiddenTestCases || [],
            company: [experience.company],
            role: experience.role,
            interviewRound: experience.interviewRound,
            yearAsked: experience.yearAsked,
            sourceType: 'community',
            sourceUrl: experience.sourceUrl,
            startCode: [],
            referenceSolution: [],
            status: 'pending',
            confidenceLevel: 'community-reported',
            reports: [{ experienceId: experience._id, submittedBy: experience.submittedBy }],
            problemCreator: experience.submittedBy
        });

        experience.generatedProblemId = newProblem._id;
        experience.status = 'generated';
        await experience.save();

        res.status(200).json({ success: true, action: 'wait_for_review', status: 'pending' });

    } catch (err) {
        // Revert processing status on error
        const { id } = req.params;
        await InterviewExperience.findByIdAndUpdate(id, { status: 'pending' });
        next(err);
    }
};

const analyzeSubmission = async (req, res, next) => {
    try {
        const { rawDescription } = req.body;
        if (!rawDescription) {
            return res.status(400).json({ success: false, message: "rawDescription is required" });
        }

        const { analyzeExperienceDetail } = require('../utils/aiGenerator');
        const analysis = await analyzeExperienceDetail(rawDescription);

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (err) {
        next(err);
    }
};

const getPublicExperiences = async (req, res, next) => {
    try {
        const experiences = await InterviewExperience.find({ status: 'approved' })
            .populate('submittedBy', 'username')
            .populate('similarProblemId', 'title difficulty')
            .populate('generatedProblemId', 'title difficulty')
            .sort({ createdAt: -1 })
            .limit(50); // Pagination could be added here

        res.status(200).json({
            success: true,
            count: experiences.length,
            data: experiences
        });
    } catch (err) {
        next(err);
    }
};

const getExperienceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const experience = await InterviewExperience.findById(id)
            .populate('submittedBy', 'username')
            .populate('similarProblemId', 'title difficulty status')
            .populate('generatedProblemId', 'title difficulty status');

        if (!experience) {
            return res.status(404).json({ success: false, message: "Experience not found" });
        }

        res.status(200).json({
            success: true,
            data: experience
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
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
};
