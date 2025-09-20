const express = require('express')
const User = require('../models/user')
const Goal = require('../models/goal')
const authorization = require('../utils/authorization')

const router = express.Router()

module.exports = (config, redis) => {
    const Auth = authorization(config, redis)

    router.get('/all', Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            
            const goals = await Goal.find({ ownedBy: user._id })

            res.status(200).json(goals)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    router.get('/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const goalID = req.params.id
            const goal = await Goal.findOne({ _id: goalID })
            
            if (!goal) return res.status(404).json({ message: 'Goal doesn\'t exist' })

            // Verify user ownership
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            if (goal.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })

            res.status(200).json(goal)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    router.post('/new', Auth.authenticateToken, async (req, res) => {
        try {
            const { goalname, requiredmoney } = req.body

            // Fetch user ID
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            const userID = user._id

            const newGoal = new Goal({
                goalname: goalname,
                ownedBy: userID,
                requiredmoney: requiredmoney
            })

            await newGoal.save()

            res.status(201).json({ message: 'Goal created' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    router.put('/edit/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const goalID = req.params.id
            
            // Verify user ownership
            const { username } = req.user
            const goal = await Goal.findOne({ _id: goalID })
            if (!goal) return res.status(404).json({ message: 'Goal doesn\'t exist' })

            const user = await User.findOne({ username: username }).select('_id')
            if (goal.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })
            
            await Goal.findOneAndUpdate({ _id: goalID }, req.body)
            await Goal.findOneAndUpdate({ _id: goalID }, { 'last-edit-date': Date.now() })

            res.status(200).json({ message: 'Goal edited' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    router.delete('/delete/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const goalID = req.params.id
            
            // Verify user ownership
            const { username } = req.user
            const goal = await Goal.findOne({ _id: goalID })
            if (!goal) return res.status(404).json({ message: 'Goal doesn\'t exist' })

            const user = await User.findOne({ username: username }).select('_id')
            if (goal.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })

            await Goal.findOneAndDelete({ _id: goalID })

            res.status(200).json({ message: 'Goal deleted' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    router.put('/complete/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const goalID = req.params.id
            
            // Verify user ownership
            const { username } = req.user
            const goal = await Goal.findOne({ _id: goalID })
            if (!goal) return res.status(404).json({ message: 'Goal doesn\'t exist' })

            const user = await User.findOne({ username: username }).select('_id')
            if (goal.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })

            await Goal.findOneAndUpdate({ _id: goalID }, { completed: true })

            res.status(200).json({ message: 'Goal completed' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    return router
}