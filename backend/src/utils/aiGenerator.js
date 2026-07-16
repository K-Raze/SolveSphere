const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are a coding problem designer for a software engineering interview preparation platform called SolveSphere.

Your job is to convert a raw interview experience description into a complete, structured coding problem.

Rules:
- The problem statement must be clear, professional, and well-formatted.
- Include realistic constraints.
- Provide 2-3 visible examples with explanations.
- Provide 3-5 hidden test cases that cover edge cases.
- Difficulty should reflect the actual complexity (easy, medium, hard).
- Tags should be relevant algorithm/data-structure topics (e.g., array, dp, graph, two-pointers, sliding-window, binary-search, etc.).
- The editorial should explain the optimal approach without giving code.
- Keep everything concise and interview-focused.

Respond with ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "title": "Problem Title",
  "description": "Full problem statement with input/output format",
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"],
  "visibleTestCases": [
    { "input": "stdin input", "output": "expected stdout", "explanation": "brief explanation" }
  ],
  "hiddenTestCases": [
    { "input": "stdin input", "output": "expected stdout" }
  ],
  "editorial": "Step-by-step explanation of the optimal approach"
}`;

/**
 * Generate a structured coding problem from a raw interview experience.
 * Uses Google Gemini API (free tier compatible).
 */
const generateProblemFromExperience = async (experience) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured. Add it to your .env file.');
    }

    const userPrompt = `Convert this interview experience into a structured coding problem:

Company: ${experience.company}
Role: ${experience.role || 'Not specified'}
Round: ${experience.interviewRound || 'Not specified'}
Year: ${experience.yearAsked || 'Not specified'}

Interview Description:
${experience.rawDescription}`;

    const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
            contents: [{
                parts: [
                    { text: SYSTEM_PROMPT },
                    { text: userPrompt }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096,
                responseMimeType: 'application/json'
            }
        },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        }
    );

    // Extract the generated text from Gemini's response
    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
        throw new Error('AI returned an empty response. Please try again.');
    }

    // Parse JSON — Gemini with responseMimeType should return clean JSON
    let parsed;
    try {
        parsed = JSON.parse(generatedText);
    } catch (err) {
        throw new Error('AI returned invalid JSON. Please try again.');
    }

    // Basic validation of required fields
    if (!parsed.title || !parsed.description || !parsed.difficulty || !parsed.visibleTestCases) {
        throw new Error('AI response is missing required fields. Please try again.');
    }

    return parsed;
};

/**
 * Detect if an interview experience describes the exact same algorithmic problem as existing matches.
 */
const detectDuplicateProblem = async (experience, matches) => {
    if (!matches || matches.length === 0) return { isDuplicate: false };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

    const formattedMatches = matches.map(m => 
        `ID: ${m._id}\nTitle: ${m.title}\nDescription: ${m.description}\nTags: ${m.tags.join(', ')}`
    ).join('\n\n---\n\n');

    const prompt = `You are a duplicate detection system for a coding platform.
Your job is to determine if a new interview experience describes the exact same core algorithmic problem as any of the existing problems in the database.

New Interview Experience Description:
${experience.rawDescription}

Existing Database Problems:
${formattedMatches}

Does the new experience describe the exact same underlying problem as any of the database problems?
Respond with ONLY valid JSON in this exact format:
{
  "isDuplicate": true|false,
  "problemId": "matching problem ID, or null if false"
}`;

    const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2, // low temperature for precise matching
                responseMimeType: 'application/json'
            }
        },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        }
    );

    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) return { isDuplicate: false };

    try {
        const parsed = JSON.parse(generatedText);
        return parsed;
    } catch (err) {
        return { isDuplicate: false };
    }
};

/**
 * Analyze an interview experience description to check if it has enough detail to generate a problem.
 * If not, generate clarifying questions.
 */
const analyzeExperienceDetail = async (rawDescription) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');

    const prompt = `You are a strict technical interviewer. A candidate is describing a coding problem they were asked.
Your job is to determine if their description contains enough specific detail to reconstruct the exact coding problem.

Specifically, check if it clearly states or implies:
1. The exact input and output data types/structures.
2. The core constraints (e.g., max value of N, time/space complexity limits).
3. Edge cases (e.g., negative numbers, empty arrays, null values).

Candidate's Description:
"${rawDescription}"

If the description is highly detailed and sufficient, respond with isComplete: true.
If the description is vague or missing constraints/edge cases, respond with isComplete: false, and provide a list of 2-3 specific, conversational questions to ask the candidate to clarify the problem.

Respond with ONLY valid JSON in this exact format:
{
  "isComplete": true|false,
  "questions": ["Question 1?", "Question 2?"] // Empty array if isComplete is true
}`;

    const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.4,
                responseMimeType: 'application/json'
            }
        },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        }
    );

    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) return { isComplete: false, questions: ["Could you provide more details about the problem, such as inputs and expected outputs?"] };

    try {
        const parsed = JSON.parse(generatedText);
        return parsed;
    } catch (err) {
        return { isComplete: false, questions: ["Could you provide more details about the constraints and edge cases?"] };
    }
};

module.exports = { generateProblemFromExperience, detectDuplicateProblem, analyzeExperienceDetail };
