require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const seedData = JSON.parse(fs.readFileSync('seed_data.json', 'utf8'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

// NOTE: To process all 50 problems, change this to seedData.slice(0, 50).
// We default to 2 to verify it works without exhausting Gemini rate limits immediately.
const BATCH_TO_PROCESS = seedData.slice(0, 2);

async function runSeed() {
    console.log("🌱 Starting Initial Database Seeding Process 🌱");
    console.log(`Processing ${BATCH_TO_PROCESS.length} problems...`);

    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        const User = require('./src/models/user');

        // 1. Create Seeder Admin
        await User.deleteOne({ emailId: "seeder@solvesphere.com" });
        const seederRes = await axios.post(`${BASE_URL}/user/register`, {
            firstName: "Admin", lastName: "Seeder", emailId: "seeder@solvesphere.com", username: "adminseeder", password: "Password123!", age: 30
        });
        const token = seederRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
        const headers = { Cookie: `token=${token}` };

        // Make user an admin directly via DB to skip manual setup
        await User.updateOne({ emailId: "seeder@solvesphere.com" }, { role: 'admin' });
        console.log("✅ Admin Seeder Account Ready");

        // 2. Iterate through seed data
        for (let i = 0; i < BATCH_TO_PROCESS.length; i++) {
            const exp = BATCH_TO_PROCESS[i];
            console.log(`\n--- Processing Problem ${i + 1}/${BATCH_TO_PROCESS.length} [${exp.company}] ---`);

            try {
                // Submit Experience
                const submitRes = await axios.post(`${BASE_URL}/experience/submit`, exp, { headers });
                const expId = submitRes.data.data._id;
                console.log(`📝 Submitted Experience: ${expId}`);

                // Generate Problem (This triggers the AI pipeline)
                console.log(`⏳ Waiting 15 seconds to respect Gemini API rate limits...`);
                await sleep(15000); 

                console.log(`🧠 AI Generating Problem...`);
                const solveRes = await axios.post(`${BASE_URL}/experience/${expId}/solve`, {}, { headers });
                
                if (solveRes.data.action === 'wait_for_review') {
                    // Approve Problem
                    console.log(`✅ AI Generation Successful. Approving Problem...`);
                    await axios.patch(`${BASE_URL}/experience/admin/${expId}/approve`, {}, { headers });
                    console.log(`🌟 Problem Approved and Published!`);
                } else if (solveRes.data.action === 'solve_existing') {
                    console.log(`🔄 Duplicate Detected! Merged with existing problem ${solveRes.data.problemId}.`);
                } else {
                    console.log(`⚠️ Unexpected response:`, solveRes.data);
                }

            } catch (err) {
                console.error(`❌ Failed to process problem ${i + 1}:`, err.response ? err.response.data : err.message);
                if (err.response && err.response.status === 429) {
                    console.error("🚨 Gemini API Rate Limit Hit. Aborting seed process early. Please run again later.");
                    break;
                }
            }
        }

        console.log("\n🎉 Seeding Process Complete! 🎉");
        process.exit(0);

    } catch (err) {
        console.error("Fatal Error:", err);
        process.exit(1);
    }
}

runSeed();
