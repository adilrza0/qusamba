const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

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

testInputValidation();
