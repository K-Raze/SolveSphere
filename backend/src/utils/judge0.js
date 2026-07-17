const axios = require('axios');

const JUDGE0_BASE_URL = 'https://judge0-ce.p.rapidapi.com';

const LANGUAGE_MAP = {
    'c++': 54,
    'cpp': 54,
    'java': 62,
    'javascript': 63,
    'js': 63,
    'python': 71
};

// Get Judge0 language ID from a language name
const getLanguageId = (language) => {
    const id = LANGUAGE_MAP[language.toLowerCase()];
    if (!id) {
        throw new Error(`Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}`);
    }
    return id;
};

// Submit a batch of code submissions to Judge0
const submitBatch = async (submissions) => {
    const response = await axios.request({
        method: 'POST',
        url: `${JUDGE0_BASE_URL}/submissions/batch`,
        params: { base64_encoded: 'false' },
        headers: {
            'x-rapidapi-key': process.env.JUDGE0_API_KEY,
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: { submissions }
    });
    return response.data;
};

// Wait for a given number of milliseconds
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Poll Judge0 for batch submission results until all are completed
const pollBatchResults = async (tokens, maxRetries = 10, intervalMs = 2000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const response = await axios.request({
            method: 'GET',
            url: `${JUDGE0_BASE_URL}/submissions/batch`,
            params: {
                tokens: tokens.join(','),
                base64_encoded: 'false',
                fields: '*'
            },
            headers: {
                'x-rapidapi-key': process.env.JUDGE0_API_KEY,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
        });

        const { submissions } = response.data;

        // status_id > 2 means processing is complete (3=Accepted, 4+=Error/WA/TLE/etc.)
        const allCompleted = submissions.every((s) => s.status_id > 2);
        if (allCompleted) {
            return submissions;
        }

        await delay(intervalMs);
    }

    throw new Error('Judge0 polling timed out: results not ready after maximum retries');
};

// Validate reference solutions against visible test cases using Judge0
const validateReferenceSolution = async (referenceSolution, visibleTestCases) => {
    for (const { language, completeCode } of referenceSolution) {
        const languageId = getLanguageId(language);

        const submissions = visibleTestCases.map((testcase) => ({
            source_code: completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const batchResult = await submitBatch(submissions);
        const tokens = batchResult.map((item) => item.token);
        const results = await pollBatchResults(tokens);

        for (const result of results) {
            // status_id 3 = "Accepted"
            if (result.status_id !== 3) {
                const statusDesc = result.status ? result.status.description : 'Unknown';
                throw new Error(
                    `Reference solution failed for ${language}: ${statusDesc}` +
                    (result.stderr ? ` — ${result.stderr}` : '')
                );
            }
        }
    }
};

module.exports = { getLanguageId, submitBatch, pollBatchResults, validateReferenceSolution };
