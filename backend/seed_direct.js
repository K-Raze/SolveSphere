require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const User = require('./src/models/user');
const Problem = require('./src/models/problem');
const InterviewExperience = require('./src/models/interviewExperience');

async function seedDirectly() {
    console.log("🚀 Starting Direct Database Seeding...");

    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        
        // 1. Get or Create Admin User
        let adminUser = await User.findOne({ emailId: "seeder@solvesphere.com" });
        if (!adminUser) {
            adminUser = await User.create({
                firstName: "Admin", lastName: "Seeder", 
                emailId: "seeder@solvesphere.com", username: "adminseeder", 
                password: "Password123!", age: 30, role: "admin"
            });
        }
        
        // 2. Read the JSON generated from Browser Gemini
        const rawData = fs.readFileSync('browser_seed_data.json', 'utf8');
        const seedData = JSON.parse(rawData);
        
        console.log(`Found ${seedData.length} items to insert.`);

        let insertedCount = 0;

        // 3. Insert directly into Database (Bypassing API limits!)
        for (const data of seedData) {
            // Normalize interviewRound to match enums
            let round = data.interviewRound.toLowerCase().replace(' ', '-');
            if (round === 'phone screen') round = 'phone-screen';
            if (!['online-assessment', 'phone-screen', 'onsite', 'take-home', 'other'].includes(round)) {
                round = 'other';
            }

            // Create the Interview Experience
            const experience = await InterviewExperience.create({
                company: data.company,
                role: data.role,
                interviewRound: round,
                yearAsked: data.yearAsked,
                rawDescription: data.rawDescription,
                submittedBy: adminUser._id, // FIXED from userId
                status: 'approved'
            });

            // Create the corresponding Problem
            const problem = await Problem.create({
                title: data.problem.title,
                description: data.problem.description,
                difficulty: data.problem.difficulty,
                tags: data.problem.tags,
                visibleTestCases: data.problem.visibleTestCases,
                hiddenTestCases: data.problem.hiddenTestCases,
                editorial: data.problem.editorial,
                confidenceLevel: 'high-confidence', // Max confidence since you are providing it!
                generatedFrom: experience._id,
                problemCreator: adminUser._id
            });

            // Link them together
            experience.similarProblemId = problem._id;
            await experience.save();

            insertedCount++;
        }

        console.log(`🎉 Successfully inserted ${insertedCount} problems directly into MongoDB!`);
        process.exit(0);

    } catch (err) {
        console.error("Fatal Error:", err);
        process.exit(1);
    }
}

seedDirectly();
