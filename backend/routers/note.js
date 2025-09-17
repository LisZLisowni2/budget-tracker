const express = require('express')
const User = require('../models/user')
const Note = require('../models/note')
const authorization = require('../utils/authorization')

const router = express.Router()

module.exports = (config, redis) => {
    const Auth = authorization(config, redis)

    router.get('/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const noteID = req.params.id
            const note = await Note.findOne({ _id: noteID })
            
            if (!note) res.status(404).json({ message: 'Note doesn\'t exist' })

            // Verify user ownership
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            if (note.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })

            res.status(200).json(note)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    return router
}