#!/bin/bash

echo "🔐 Admin Dashboard Login Script"
echo "================================"

echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mdhamala2000@gmail.com","password":"admin123"}')

echo "Response: $LOGIN_RESPONSE"

# Extract tokens from response
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accesstoken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo ""
    echo "✅ Login successful!"
    echo ""
    echo "📋 Copy these commands and run them in your browser console (F12):"
    echo "localStorage.setItem('accessToken', '$ACCESS_TOKEN');"
    echo "localStorage.setItem('refreshToken', '$REFRESH_TOKEN');"
    echo ""
    echo "🔗 Then open: http://localhost:3000"
    echo ""
    echo "📝 Or use the HTML helper file:"
    echo "open admin-login-helper.html"
else
    echo "❌ Login failed"
fi