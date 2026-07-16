const Problem = require('../models/problem');
const Submission = require('../models/submission');
const User = require('../models/user');
const { getLanguageId, submitBatch, pollBatchResults } = require('../utils/judge0');

// Parse Judge0 status logic robustly
const parseJudge0Result = (testResult) => {
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = '';

    for (const test of testResult) {
        // Status 3 is "Accepted"
        if (test.status_id === 3) {
            testCasesPassed++;
            runtime += parseFloat(test.time || 0);
            memory = Math.max(memory, test.memory || 0);
        } else {
            // Find the first failing test case and record its status
            if (status === 'accepted') {
                if (test.status_id === 4) {
                    status = 'wrong';
                    errorMessage = 'Wrong Answer';
                } else if (test.status_id === 5) {
                    status = 'error';
                    errorMessage = 'Time Limit Exceeded';
                } else if (test.status_id === 6) {
                    status = 'error';
                    errorMessage = 'Compilation Error: ' + (test.compile_output || 'Unknown error');
                } else if (test.status_id >= 7 && test.status_id <= 12) {
                    status = 'error';
                    errorMessage = 'Runtime Error: ' + (test.stderr || test.status.description);
                } else {
                    status = 'error';
                    errorMessage = 'Error: ' + (test.status ? test.status.description : 'Unknown');
                }
            }
        }
    }

    return { testCasesPassed, runtime, memory, status, errorMessage };
};

const submitCode = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        if (!userId || !code || !problemId || !language) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        // 1. Create a pending submission in the DB
        const submission = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal: problem.hiddenTestCases.length
        });

        // 2. Map language and prepare Judge0 batch payload using hidden test cases
        const languageId = getLanguageId(language);
        const judge0Submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        // 3. Submit to Judge0 and poll for results
        const submitResult = await submitBatch(judge0Submissions);
        const tokens = submitResult.map((value) => value.token);
        const testResult = await pollBatchResults(tokens);

        // 4. Parse results robustly
        const { testCasesPassed, runtime, memory, status, errorMessage } = parseJudge0Result(testResult);

        // 5. Update submission in DB
        submission.status = status;
        submission.testCasesPassed = testCasesPassed;
        submission.errorMessage = errorMessage;
        submission.runtime = runtime;
        submission.memory = memory;
        await submission.save();

        // 6. Atomically add problem to user's solved array if they passed all test cases
        if (status === 'accepted') {
            const user = await User.findById(userId);
            const isNewlySolved = !user.problemSolved.includes(problemId);

            if (isNewlySolved) {
                await User.findByIdAndUpdate(userId, {
                    $addToSet: { problemSolved: problemId },
                    $inc: { reputation: 10 }
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Submission evaluated successfully",
            data: submission
        });
    } catch (err) {
        next(err);
    }
};

const runCode = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        if (!userId || !code || !problemId || !language) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        // For "run code", we use visible test cases and DO NOT save to DB
        const languageId = getLanguageId(language);
        const judge0Submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult = await submitBatch(judge0Submissions);
        const tokens = submitResult.map((value) => value.token);
        const testResult = await pollBatchResults(tokens);

        const { testCasesPassed, runtime, memory, status, errorMessage } = parseJudge0Result(testResult);

        res.status(200).json({
            success: true,
            message: "Run complete",
            data: {
                testCasesTotal: problem.visibleTestCases.length,
                testCasesPassed,
                runtime,
                memory,
                status,
                errorMessage,
                rawResults: testResult // Allow client to see expected vs actual for visible test cases
            }
        });
    } catch (err) {
        next(err);
    }
};

const saveDraft = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;
        const { code, language } = req.body;

        const CodeDraft = require('../models/codeDraft');
        
        await CodeDraft.findOneAndUpdate(
            { userId, problemId },
            { code, language },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: "Draft saved" });
    } catch (err) {
        next(err);
    }
};

const getDraft = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const problemId = req.params.id;

        const CodeDraft = require('../models/codeDraft');
        const draft = await CodeDraft.findOne({ userId, problemId });

        res.status(200).json({
            success: true,
            data: draft || { code: '', language: 'javascript' }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    runCode,
    submitCode,
    saveDraft,
    getDraft
};
