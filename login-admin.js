#!/usr/bin/env node

const fetch = require('node-fetch');

async function loginAsAdmin() {
    console.log('Logging in as admin...');

    try {
        const response = await fetch('http://localhost:8000/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'mdhamala2000@gmail.com',
                password: 'admin123'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Login successful!');
            console.log('Access Token:', data.data.accesstoken);
            console.log('Refresh Token:', data.data.refreshToken);
            console.log('\n📋 Copy this command to set the token in your browser console:');
            console.log(`localStorage.setItem('accessToken', '${data.data.accesstoken}');`);
            console.log(`localStorage.setItem('refreshToken', '${data.data.refreshToken}');`);
            console.log('\n🔗 Now open: http://localhost:3000');
        } else {
            console.log('❌ Login failed:', data.message);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

loginAsAdmin();