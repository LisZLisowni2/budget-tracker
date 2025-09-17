const express = require('express')
const User = require('../models/user')
const Note = require('../models/note')

const router = express.Router()

module.exports = (config, redis) => {
    router.get('/:id', async (req, res) => {
        try {
            const noteID = req.params.id

            const note = await Note.findOne({ _id: noteID })
            res.status(200).json(note)
        } catch {
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    return router
}