const axios = require('axios');
const Problem = require('../models/problem');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Get a Code-Aware Hint
 * Analyzes the user's current code and provides a subtle hint to unblock them.
 */
const getHint = async (req, res, next) => {
    try {
        const { problemId, code, language } = req.body;

        if (!problemId || !code) {
            return res.status(400).json({ success: false, message: "problemId and code are required." });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "AI services are not configured." });
        }

        const systemPrompt = `You are an expert technical interviewer at a top tech company. 
The candidate is trying to solve the following problem:
Title: ${problem.title}
Description: ${problem.description}

They are writing in ${language || 'a programming language'}.
Your task is to provide a SINGLE, SUBTLE hint to help them get unblocked based on their current code.
CRITICAL RULES:
- DO NOT provide the exact code or the full solution.
- Be concise (max 3 sentences).
- If their code has a syntax error or obvious bug, point it out gently.
- If they are on the wrong track, hint at the correct data structure or algorithm (e.g., "Have you considered using a stack?").
- If their logic is mostly correct but missing an edge case, mention the edge case.`;

        const userPrompt = `Here is my current code:\n\n${code}\n\nPlease give me a hint.`;

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: userPrompt }
                    ]
                }],
                generationConfig: {
                    temperature: 0.3, // Low temperature for more focused/analytical hints
                    maxOutputTokens: 150
                }
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );

        const hint = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!hint) {
            throw new Error('AI returned an empty response.');
        }

        res.status(200).json({
            success: true,
            data: { hint: hint.trim() }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Mock Interview Chat
 * Acts as a senior engineer discussing the problem. Completely stateless (frontend manages history).
 */
const chatInterviewer = async (req, res, next) => {
    try {
        const { problemId, code, chatHistory } = req.body;
        // chatHistory should be an array of objects: { role: 'user' | 'model', text: '...' }

        if (!problemId || !chatHistory || !Array.isArray(chatHistory)) {
            return res.status(400).json({ success: false, message: "problemId and valid chatHistory are required." });
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: "AI services are not configured." });
        }

        const systemPrompt = `You are a Senior Software Engineer conducting a technical interview.
The candidate is solving: ${problem.title}.
Description: ${problem.description}

Rules for the interview:
- Be encouraging but professional, like a real interviewer.
- Ask clarifying questions if the candidate is vague.
- Discuss time and space complexity if they haven't mentioned it.
- Never write code for them. If they ask for the answer, guide them to think about it instead.
- Keep responses short and conversational.`;

        // Format history for Gemini API
        // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
        const formattedHistory = chatHistory.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // Add the system prompt as the first user message (or inject it)
        // Gemini API handles context best when passed in the first message or as system instructions.
        // We will just prepend a hidden user message for the system prompt if the history is new,
        // but it's safer to just inject it. For simplicity, we send a new message with context.

        const latestUserMessage = formattedHistory.pop(); 
        
        const contextMessage = `Context: The candidate's current code is:\n${code || '(No code written yet)'}\n\n`;

        latestUserMessage.parts[0].text = contextMessage + latestUserMessage.parts[0].text;

        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Understood. I am ready to act as the interviewer." }] },
            ...formattedHistory,
            latestUserMessage
        ];

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${apiKey}`,
            {
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300
                }
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) {
            throw new Error('AI returned an empty response.');
        }

        res.status(200).json({
            success: true,
            data: { reply: reply.trim() }
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    getHint,
    chatInterviewer
};
