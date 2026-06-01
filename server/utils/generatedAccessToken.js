import jwt from 'jsonwebtoken'

const generatedAccessToken = async (userId) => {
    const token = await jwt.sign(
        { id: userId, type: 'access', iat: Date.now() },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { 
            expiresIn: '1h',  // Reduced from 24h for security
            issuer: 'yakpashamina'
        }
    )

    return token
}

export default generatedAccessToken