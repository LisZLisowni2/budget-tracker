const express = require('express')
const User = require('../models/user')
const Note = require('../models/note')
const Transaciton = require('../models/transaction')
const Goal = require('../models/goal')

const router = express.Router()

module.exports = () => {
    router.post('/cleanup', async (req, res) => {
        try {
            await User.deleteMany({})
            await Note.deleteMany({})
            await Transaciton.deleteMany({})
            await Goal.deleteMany({})

            res.status(200).json({ 'message': 'Database cleared' })
        } catch (err) {
            res.status(500).json({ 'message': 'Internal server error', 'error': err })
        }
    })
    
    return router
}