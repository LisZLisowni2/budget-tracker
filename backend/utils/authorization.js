const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports = (config, redis) => {
    return {
        authenticateToken: function authenticateToken(req, res, next) {
            const token = req.headers.authorization?.split(" ")[1];
    
            if (!token) return res.status(401).json({ 'message': 'Token missing, access denied' });
    
            jwt.verify(token, config.JWT_Secret, async (err, decoded) => {
                if (err) return res.status(403).json({ 'message': 'Invalid token' })
                const sessionExist = await redis.get(decoded.sessionID)
                if (!sessionExist) {
                    res.status(401).json({ 'message': 'Session expired or has invalided'})
                }
                req.user = decoded
                next()
            })
        },
        authorizedAccess: function authorizedAccess(requiredRole) {
            return async(req, res, next) => {
                const { username } = req.user
                const user = await User.findOne({ username: username }).select('scope')
                if (user.scope !== requiredRole) return res.status(401).json({ 'message': 'Access denied' })
                return next()
            }
        }
    }
}