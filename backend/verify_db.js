require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./src/models/problem');
const InterviewExperience = require('./src/models/interviewExperience');

async function verify() {
    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        
        const count = await Problem.countDocuments();
        console.log(`Total Problems in DB: ${count}`);
        
        // Fetch the most recently added problem and its test cases
        const sampleProblem = await Problem.findOne().sort({ createdAt: -1 });
        
        if (sampleProblem) {
            console.log("\n--- Sample Problem Data ---");
            console.log(`Title: ${sampleProblem.title}`);
            console.log(`Difficulty: ${sampleProblem.difficulty}`);
            console.log(`Tags: ${sampleProblem.tags.join(', ')}`);
            console.log(`Visible Test Cases Count: ${sampleProblem.visibleTestCases.length}`);
            console.log(`Hidden Test Cases Count: ${sampleProblem.hiddenTestCases.length}`);
            console.log(`Confidence Level: ${sampleProblem.confidenceLevel}`);
            
            console.log("\nSample Visible Test Case 1:");
            console.log(sampleProblem.visibleTestCases[0]);
            
            console.log("\nSample Hidden Test Case 1:");
            console.log(sampleProblem.hiddenTestCases[0]);
        }
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verify();
