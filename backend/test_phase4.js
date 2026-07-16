const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3000';

async function testPhase4() {
    try {
        console.log("=== Testing Phase 4: Platform Polish ===");
        
        // Connect directly to DB for clean up
        require('dotenv').config({ path: './.env' });
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        const User = require('./src/models/user');
        const Problem = require('./src/models/problem');
        const CodeDraft = require('./src/models/codeDraft');
        const Discussion = require('./src/models/discussion');

        // Cleanup previous test
        await User.deleteOne({ emailId: "phase4@test.com" });
        await Problem.deleteOne({ title: "Test Problem P4" });
        await CodeDraft.deleteMany({});
        await Discussion.deleteMany({});

        // 1. Register and Login
        const regRes = await axios.post(`${BASE_URL}/user/register`, {
            firstName: "Phase", lastName: "Four", emailId: "phase4@test.com", username: "phase4user", password: "Password123!"
        });
        const token = regRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
        const config = { headers: { Cookie: `token=${token}` } };
        const userDoc = await User.findOne({ emailId: "phase4@test.com" });
        const userId = userDoc._id;
        
        console.log("✅ User registered and authenticated");

        // 2. Create a test problem directly
        const problem = await Problem.create({
            title: "Test Problem P4",
            description: "Test description",
            difficulty: "easy",
            tags: ["test"],
            status: "approved",
            problemCreator: userId
        });
        const problemId = problem._id.toString();
        console.log("✅ Test problem created");

        // 3. Test Drafts
        await axios.post(`${BASE_URL}/submission/draft/${problemId}`, {
            code: "console.log('draft');", language: "javascript"
        }, config);
        
        const draftRes = await axios.get(`${BASE_URL}/submission/draft/${problemId}`, config);
        if (draftRes.data.data.code === "console.log('draft');") {
            console.log("✅ Code auto-save (Drafts) works");
        } else {
            console.error("❌ Drafts failed");
        }

        // 4. Test Discussions
        await axios.post(`${BASE_URL}/discussion/${problemId}`, {
            content: "This is a great test problem!"
        }, config);

        const discRes = await axios.get(`${BASE_URL}/discussion/${problemId}`);
        if (discRes.data.data.length === 1 && discRes.data.data[0].content === "This is a great test problem!") {
            console.log("✅ Discussions work");
        } else {
            console.error("❌ Discussions failed");
        }

        // 5. Test Public Profile
        const profileRes = await axios.get(`${BASE_URL}/user/profile/phase4user`);
        if (profileRes.data.data.username === "phase4user" && profileRes.data.data.reputation === 0) {
            console.log("✅ Public Profile works");
        } else {
            console.error("❌ Public Profile failed");
        }

        // 6. Test Reputation update via DB directly (simulating a submission/approval)
        await User.findByIdAndUpdate(userId, { $inc: { reputation: 10 } });

        // 7. Test Leaderboard
        const lbRes = await axios.get(`${BASE_URL}/user/leaderboard`);
        const userInLb = lbRes.data.data.find(u => u.username === "phase4user");
        if (userInLb && userInLb.reputation === 10) {
            console.log("✅ Leaderboard and Reputation score works");
        } else {
            console.error("❌ Leaderboard failed");
        }

        console.log("=== Phase 4 Testing Complete! ===");
        process.exit(0);
    } catch (error) {
        console.error("Test failed:");
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

testPhase4();
