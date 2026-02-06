const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testRateLimit() {
    console.log('\n--- Testing Rate Limiting ---');
    let successCount = 0;
    let blocked = false;

    // Attempt to hit the health endpoint 105 times (limit is 100)
    const requests = [];
    for (let i = 0; i < 110; i++) {
        requests.push(axios.get(`${BASE_URL}/health`));
    }

    try {
        const results = await Promise.allSettled(requests);
        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                successCount++;
            } else if (result.status === 'rejected' && result.reason.response && result.reason.response.status === 429) {
                blocked = true;
            }
        });

        console.log(`Successful requests: ${successCount}`);
        console.log(`Rate limit triggered: ${blocked ? 'YES (SUCCESS)' : 'NO (FAILURE)'}`);
    } catch (error) {
        console.error('Rate limit test error details:', error.response ? error.response.status : error.message);
    }
}

async function testInputValidation() {
    console.log('\n--- Testing Input Validation ---');

    try {
        // Invalid email
        await axios.post(`${BASE_URL}/auth/register`, {
            firstName: 'Test',
            lastName: 'User',
            email: 'invalid-email',
            password: 'password123',
            phone: '1234567890'
        });
        console.log('Invalid email test: FAILED (Should have returned 400)');
    } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.errors) {
            console.log('Invalid email test: PASSED (Got 400 with errors)');
        } else {
            console.log('Invalid email test: FAILED');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Data:', JSON.stringify(error.response.data));
            } else {
                console.log('Error:', error.message);
            }
        }
    }

    try {
        // Short password
        await axios.post(`${BASE_URL}/auth/register`, {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: '123', // Too short
            phone: '1234567890'
        });
        console.log('Short password test: FAILED (Should have returned 400)');
    } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.errors) {
            console.log('Short password test: PASSED (Got 400 with errors)');
        } else {
            console.log('Short password test: FAILED');
            if (error.response) {
                console.log('Status:', error.response.status);
                console.log('Data:', JSON.stringify(error.response.data));
            } else {
                console.log('Error:', error.message);
            }
        }
    }
}

async function runTests() {
    try {
        await testRateLimit();
        await testInputValidation();
    } catch (err) {
        console.error("Test suite failed:", err);
    }
}

runTests();
