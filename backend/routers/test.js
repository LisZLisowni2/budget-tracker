const express = require('express')
const User = require('../models/user')
const Note = require('../models/note')
const Transaciton = require('../models/transaction')
const Goal = require('../models/goal')

const router = express.Router()

module.exports = () => {
    /**
     * @swagger
     * /api/cleanup/:
     *   get:
     *     summary: Cleanup database
     *     tags:
     *       - Other
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Database cleared
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message: 
     *                   type: string
     *                   example: Database cleared
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