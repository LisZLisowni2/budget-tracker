const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports = (config) => {
    return {
        authenticateToken: function authenticateToken(req, res, next) {
            const token = req.cookies.token
    
            if (!token) return res.status(401).json({ 'message': 'Token missing, access denied' });
    
            jwt.verify(token, config.JWT_Secret, (err, user) => {
                if (err) return res.status(403).json({ 'message': 'Invalid token' })
                req.user = user
                next()
            })
        },
        authorizedAccess: function authorizedAccess(requiredRole) {
            return async(req, res, next) => {
                const username = req.user.username
                const user = await User.findOne({ username: username }).select('scope')
                if (user.scope !== requiredRole) return res.status(401).json({ 'message': 'Access denied' })
                return next()
            }
        }
    }
}