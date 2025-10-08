const express = require('express')
const User = require('../models/user')
const Note = require('../models/note')
const authorization = require('../utils/authorization')

const router = express.Router()

module.exports = (config, redis) => {
    const Auth = authorization(config, redis)

    router.get('/all', Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            
            const notes = await Note.find({ ownedBy: user._id })

            res.status(200).json(notes)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })
    
    router.get('/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const noteID = req.params.id
            const note = await Note.findOne({ _id: noteID })
            
            if (!note) return res.status(404).json({ message: 'Note doesn\'t exist' })

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

    router.post('/new', Auth.authenticateToken, async (req, res) => {
        try {
            const { title, content } = req.body

            if (title === undefined || content === undefined) return res.status(404).json({ message: "Title or content doesn't exist in request body" })

            // Fetch user ID
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            const userID = user._id

            const newNote = new Note({
                title: title,
                ownedBy: userID,
                content: content
            })

            await newNote.save()

            res.status(201).json({ message: 'Note created' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    router.put('/edit/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const noteID = req.params.id
            
            // Verify user ownership
            const { username } = req.user
            const note = await Note.findOne({ _id: noteID })
            if (!note) return res.status(404).json({ message: 'Note doesn\'t exist' })

            const user = await User.findOne({ username: username }).select('_id')
            if (note.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })
            
            await Note.findOneAndUpdate({ _id: noteID }, req.body)
            await Note.findOneAndUpdate({ _id: noteID }, { 'last-edit-date': Date.now() })

            res.status(200).json({ message: 'Note edited' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    router.delete('/delete/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const noteID = req.params.id
            
            // Verify user ownership
            const { username } = req.user
            const note = await Note.findOne({ _id: noteID })
            if (!note) return res.status(404).json({ message: 'Note doesn\'t exist' })

            const user = await User.findOne({ username: username }).select('_id')
            if (note.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })

            await Note.findOneAndDelete({ _id: noteID })

            res.status(200).json({ message: 'Note deleted' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    return router
}