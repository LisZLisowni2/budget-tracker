const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router();

module.exports = (config, redis) => {
    const Auth = require('../utils/authorization')(config)

    router.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body
            if (!username || !password) return res.status(400).json({ 'message': 'Username or password not present'})
            
            const user = User.findOne({ username: username }).select('password')
            if (!user) return res.status(404).json({ 'message': 'User not found' })
            
            const passTest = bcrypt.compare(password, user.password)
            if (!passTest) return res.status(401).json({ 'message': 'Wrong password'})
            
            const sessionID = Date.now() + Math.random().toString(36).substring(2)
            await redis.setEx(sessionID, 60 * 60, username)
            const token = jwt.sign({ username: username, sessionID: sessionID }, config.JWT_Secret, { expiresIn: '1h' })
            res.json({ 'message': 'Login successful', token })
        } catch (err) {
            res.status(500).json({ 'message': 'Internal server error' })
        }
    })

    router.post('/register', async (req, res) => {
        try {
            const { username, email, password } = req.body
            if (!username || !email || !password) {
                res.status(400).json({ 'message': 'Useername, email or password not present' })
            }
            const hashedPassword = bcrypt.hash(password, 10)
            const newUser = new User({ username: username, email: email, password: hashedPassword })
            await newUser.save()
            res.status(201).json({ 'message': 'Account created' })
        } catch (err) {
            res.status(500).json({ 'message': 'Internal server error' })
        }
    })

    router.get('/me', Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user
            const userData = User.findOne({ username: username }).select("-v -_id -password")
            res.json(userData)
        } catch {
            res.status(500).json({ 'message': 'Internal server error' })
        }
    })

    router.get('/logout', Auth.authenticateToken, async (req, res) => {
        try {
            await redis.del(req.user.sessionID)
            res.json({ 'message': 'Logout successful' })
        } catch {
            res.status(500).json({ 'message': 'Internal server error '})
        }
    })

    return router;
}