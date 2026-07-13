require('dotenv').config();
const { validateReferenceSolution } = require('./src/utils/judge0.js');

async function testJudge0() {
    console.log('Testing Judge0 API using key:', process.env.JUDGE0_API_KEY ? (process.env.JUDGE0_API_KEY.slice(0, 5) + '...') : 'undefined');

    const referenceSolution = [{
        language: 'javascript',
        completeCode: 'const fs = require("fs"); const input = fs.readFileSync(0, "utf-8").trim(); console.log(parseInt(input) * 2);'
    }];

    const visibleTestCases = [
        { input: '2', output: '4\n' },
        { input: '5', output: '10\n' }
    ];

    try {
        console.log('Submitting reference solution to Judge0...');
        await validateReferenceSolution(referenceSolution, visibleTestCases);
        console.log('✅ Judge0 validation SUCCESSFUL!');
    } catch (error) {
        console.error('❌ Judge0 validation FAILED!');
        console.error(error.message);
    }
}

testJudge0();
