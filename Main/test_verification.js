require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./src/models/user');
const Problem = require('./src/models/problem');
const InterviewExperience = require('./src/models/interviewExperience');

const BASE_URL = 'http://localhost:3000';
let userToken = '';
let adminToken = '';
let userId = '';
let adminId = '';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
    console.log("=== Testing Community Interview Verification System ===");

    try {
        require('dotenv').config({ path: './.env' });
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        
        // Clean up previous test runs
        await User.deleteMany({ emailId: { $in: ['verifyuser@test.com', 'verifyadmin@test.com'] } });
        await Problem.deleteMany({ title: /Verification Test Problem/ });
        await InterviewExperience.deleteMany({ company: 'VerificationCorp' });

        // 1. Register User
        const regRes = await axios.post(`${BASE_URL}/user/register`, {
            firstName: "Verify", lastName: "User", emailId: "verifyuser@test.com", username: "verifyuser", password: "Password123!", age: 25
        });
        userToken = regRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
        const userDoc = await User.findOne({ emailId: "verifyuser@test.com" });
        userId = userDoc._id;
        const userHeaders = { Cookie: `token=${userToken}` };
        console.log("✅ User registered and authenticated");

        // 2. Register Admin
        await User.create({
            firstName: "Admin", lastName: "Verify", emailId: "verifyadmin@test.com", username: "verifyadmin",
            password: "password", role: 'admin', age: 30
        });
        const adminUser = await User.findOne({ emailId: "verifyadmin@test.com" });
        adminToken = adminUser.getJwtToken();
        adminId = adminUser._id.toString();
        const adminHeaders = { Cookie: `token=${adminToken}` };
        console.log("✅ Admin created and authenticated");

        // 3. Submit Experience A (New)
        const expARes = await axios.post(`${BASE_URL}/experience/submit`, {
            company: 'VerificationCorp',
            role: 'Software Engineer',
            interviewRound: 'onsite',
            yearAsked: 2026,
            rawDescription: 'I was asked to implement a Verification Test Problem. Given an array of integers, find the sum of all elements. Also explain the time complexity. The interviewer was nice.'
        }, { headers: userHeaders });
        
        const expAId = expARes.data.data._id;
        console.log("✅ Experience A submitted");

        // 4. User clicks "Solve This Problem" for Exp A
        console.log("⏳ Generating problem for Experience A...");
        const solveARes = await axios.post(`${BASE_URL}/experience/${expAId}/solve`, {}, { headers: userHeaders });
        
        if (solveARes.data.action !== 'wait_for_review') {
            throw new Error(`Expected wait_for_review, got ${solveARes.data.action}`);
        }

        const updatedExpA = await InterviewExperience.findById(expAId);
        const problemA = await Problem.findById(updatedExpA.generatedProblemId);
        
        if (problemA.confidenceLevel !== 'community-reported') {
            throw new Error(`Expected confidence community-reported, got ${problemA.confidenceLevel}`);
        }
        console.log("✅ Experience A generated a new Problem (community-reported)");

        // 5. Submit Experience B (Duplicate)
        const expBRes = await axios.post(`${BASE_URL}/experience/submit`, {
            company: 'VerificationCorp',
            role: 'Backend Engineer',
            interviewRound: 'phone-screen',
            yearAsked: 2026,
            rawDescription: 'For my interview, I got asked a Verification Test Problem. I had to sum up all the numbers in an array and analyze the Big O complexity.'
        }, { headers: userHeaders });

        const expBId = expBRes.data.data._id;
        console.log("✅ Experience B submitted (Duplicate of A)");

        // 6. User clicks "Solve This Problem" for Exp B
        console.log("⏳ Checking duplicate for Experience B...");
        const solveBRes = await axios.post(`${BASE_URL}/experience/${expBId}/solve`, {}, { headers: userHeaders });
        
        if (solveBRes.data.action !== 'solve_existing') {
            throw new Error(`Expected solve_existing, got ${solveBRes.data.action}`);
        }

        const updatedExpB = await InterviewExperience.findById(expBId);
        const updatedProblemA = await Problem.findById(problemA._id);

        if (updatedExpB.similarProblemId.toString() !== problemA._id.toString()) {
            throw new Error("Duplicate detection failed to link similarProblemId");
        }
        if (updatedProblemA.frequency !== 2) {
            throw new Error("Frequency not updated");
        }
        if (updatedProblemA.confidenceLevel !== 'multiple-reports') {
            throw new Error(`Expected confidence multiple-reports, got ${updatedProblemA.confidenceLevel}`);
        }
        console.log("✅ Experience B detected as duplicate! Problem frequency=2, confidence=multiple-reports");

        // 7. Admin Approves Experience A
        await axios.patch(`${BASE_URL}/experience/admin/${expAId}/approve`, {}, { headers: adminHeaders });
        
        const finalProblemA = await Problem.findById(problemA._id);
        if (finalProblemA.confidenceLevel !== 'high-confidence') {
            throw new Error(`Expected confidence high-confidence, got ${finalProblemA.confidenceLevel}`);
        }
        if (finalProblemA.status !== 'approved') {
            throw new Error(`Expected status approved, got ${finalProblemA.status}`);
        }
        console.log("✅ Admin approved Experience A. Problem upgraded to high-confidence and approved.");

        console.log("=== Verification System Testing Complete! ===");
        process.exit(0);

    } catch (err) {
        console.error("Test failed:");
        console.error(err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

runTests();
