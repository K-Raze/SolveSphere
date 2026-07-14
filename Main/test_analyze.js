const axios = require('axios');
const User = require('./src/models/user');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const BASE_URL = 'http://localhost:3000';

async function testAnalyze() {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        
        // Login to get token
        const loginRes = await axios.post(`${BASE_URL}/user/login`, {
            emailId: "verifyuser@test.com", password: "Password123!"
        });
        const token = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
        const headers = { Cookie: `token=${token}` };

        console.log("=== Testing AI Clarification Workflow ===");

        // Test 1: Vague Description
        console.log("Test 1: Submitting a vague description...");
        const vagueRes = await axios.post(`${BASE_URL}/experience/analyze`, {
            rawDescription: "They asked me to reverse a linked list."
        }, { headers });
        console.log("Response:", vagueRes.data.data);

        if (vagueRes.data.data.isComplete) {
            throw new Error("AI should have flagged this as incomplete!");
        }

        // Test 2: Detailed Description
        console.log("\nTest 2: Submitting a detailed description...");
        const detailedRes = await axios.post(`${BASE_URL}/experience/analyze`, {
            rawDescription: "Given the head of a singly linked list, reverse the list, and return the reversed list. The number of nodes in the list is the range [0, 5000]. -5000 <= Node.val <= 5000. Time complexity should be O(N) and space complexity O(1)."
        }, { headers });
        console.log("Response:", detailedRes.data.data);

        if (!detailedRes.data.data.isComplete) {
            throw new Error("AI should have flagged this as complete!");
        }

        console.log("✅ AI Clarification Workflow tested successfully.");
        process.exit(0);

    } catch (err) {
        console.error("Test failed:");
        console.error(err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

testAnalyze();
