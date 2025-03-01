const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router();

module.exports = (config) => {
    const authorization = require('../utils/authorization')(config)

    router.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body
            if (!username || !password) return res.status(400).json({ 'message': 'Username or password not present'})
            
            const user = User.findOne({ username: username }).select('password')
            if (!user) return res.status(404).json({ 'message': 'User not found' })
            
            const passTest = bcrypt.compare(password, user.password)
            if (!passTest) return res.status(401).json({ 'message': 'Wrong password'})

            const token = jwt.sign({ username: username}, config.JWT_Secret, { expiresIn: '1h' })
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 3600000 // 1 hour
            })
            res.json({ 'message': 'Login successful', token })
        } catch (err) {
            res.status(500).status({ 'message': 'Internal server error' })
        }
    })

    return router;
}