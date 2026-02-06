const axios = require('axios');

async function testApi() {
    try {
        console.log('Testing GET http://localhost:5000/api/products...');
        const res = await axios.get('http://localhost:5000/api/products');
        console.log('Status:', res.status);
        console.log('Data count:', res.data.products ? res.data.products.length : 'N/A');
        console.log('Pagination:', res.data.pagination);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    }
}

testApi();
