const express = require('express')
const User = require('../models/user')
const Goal = require('../models/goal')
const authorization = require('../utils/authorization')

const router = express.Router()

module.exports = (config, redis) => {
    const Auth = authorization(config, redis)

    /**
     * @swagger
     * /api/goals/:
     *   get:
     *     summary: List of goals
     *     tags:
     *       - Goal
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: List of goals for user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 goals:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *                       name:
     *                         type: string
     *                         example: Goal 1
     *                       requiredValue:
     *                         type: number
     *                         example: 1300
     *                       isCompleted:
     *                         type: boolean
     *                       createdAt:
     *                         type: string
     *                         example: 2020-01-01T00:00:00.000Z
     *                       updatedAt:
     *                         type: string
     *                         example: 2020-01-01T00:00:00.000Z
     *                       ownedBy:
     *                         type: string
     *                         example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    router.get('/all', Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            
            if (await redis.get(`ALL-GOALS-${user._id.toString()}`)) {
                const goals = await redis.get(`ALL-GOALS-${user._id.toString()}`)
                return res.status(200).json(JSON.parse(goals))
            }
            const goals = await Goal.find({ ownedBy: user._id })
            await redis.setEx(`ALL-GOALS-${user._id.toString()}`, 60 * 60, JSON.stringify(goals))

            res.status(200).json(goals)
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

        /**
     * @swagger
     * /api/goals/{id}:
     *   get:
     *     summary: Certain goal
     *     tags:
     *       - Goal
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: query
     *         name: id
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: List of goals for user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 goal:
     *                   type: object
     *                   properties:
     *                     _id:
     *                       type: string
     *                       example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *                     name:
     *                       type: string
     *                       example: Goal 1
     *                     requiredValue:
     *                       type: number
     *                       example: 1300
     *                     isCompleted:
     *                       type: boolean
     *                       example: false
     *                     createdAt:
     *                       type: string
     *                       example: 2020-01-01T00:00:00.000Z
     *                     updatedAt:
     *                       type: string
     *                       example: 2020-01-01T00:00:00.000Z
     *                     ownedBy:
     *                       type: string
     *                       example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
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
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })
    /**
     * @swagger
     * /api/goals/new/:
     *   post:
     *     summary: Create new goal
     *     tags:
     *       - Goal
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: Goal 1
     *               requiredValue:
     *                 type: number
     *                 example: 1300
     *     responses:
     *       201:
     *         description: New goal created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Goal created
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Bad request
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    router.post('/new', Auth.authenticateToken, async (req, res) => {
        try {
            const { name, requiredValue } = req.body

            // Fetch user ID
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            const userID = user._id

            const newGoal = new Goal({
                name: name,
                ownedBy: userID,
                requiredValue: requiredValue
            })

            await newGoal.save()
            await redis.del(`ALL-GOALS-${userID.toString()}`)

            res.status(201).json({ message: 'Goal created' })
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

        /**
     * @swagger
     * /api/goals/edit/{id}:
     *   put:
     *     summary: Update goal
     *     tags:
     *       - Goal
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: query
     *         name: id
     *         required: true
     *         type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: Goal 1
     *               requiredValue:
     *                 type: number
     *                 example: 1300
     *     responses:
     *       200:
     *         description: Goal updated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Goal created
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Bad request
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
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
            await Goal.findOneAndUpdate({ _id: goalID }, { 'updatedAt': Date.now() })
            await redis.del(`ALL-GOALS-${user._id.toString()}`)

            res.status(200).json({ message: 'Goal edited' })
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

        /**
     * @swagger
     * /api/goals/delete/{id}:
     *   delete:
     *     summary: Delete goal
     *     tags:
     *       - Goal
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: query
     *         name: id
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Goal deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Goal deleted
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Bad request
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
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
            await redis.del(`ALL-GOALS-${user._id.toString()}`)

            res.status(200).json({ message: 'Goal deleted' })
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

        /**
     * @swagger
     * /api/goals/complete/{id}:
     *   put:
     *     summary: Complete the goal
     *     tags:
     *       - Goal
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: query
     *         name: id
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Goal completed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Goal completed
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Bad request
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    router.put('/complete/:id', Auth.authenticateToken, async (req, res) => {
        try {
            const goalID = req.params.id
            
            // Verify user ownership
            const { username } = req.user
            const goal = await Goal.findOne({ _id: goalID })
            if (!goal) return res.status(404).json({ message: 'Goal doesn\'t exist' })

            const user = await User.findOne({ username: username }).select('_id')
            if (goal.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })

            await Goal.findOneAndUpdate({ _id: goalID }, { isCompleted: true })
            await Goal.findOneAndUpdate({ _id: goalID }, { 'updatedAt': Date.now() })
            await redis.del(`ALL-GOALS-${user._id.toString()}`)

            res.status(200).json({ message: 'Goal completed' })
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    return router
}