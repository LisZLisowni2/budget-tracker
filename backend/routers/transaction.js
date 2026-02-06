const express = require('express')
const User = require('../models/user')
const Transaction = require('../models/transaction')
const authorization = require('../utils/authorization')

const router = express.Router()

module.exports = (config, redis) => {
    const Auth = authorization(config, redis)

    /**
     * @swagger
     * /api/transactions/:
     *   get:
     *     summary: List of transactions
     *     tags:
     *       - Transaction
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: List of transactions for user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 transactions:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *                       name:
     *                         type: string
     *                         example: transaction 1
     *                       value:
     *                         type: number
     *                         example: 1300
     *                       category:  
     *                         type: string
     *                         example: Entertainment
     *                       receiver:
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
            
            if (await redis.get(`ALL-TRANSACTIONS-${user._id.toString()}`)) {
                const transactions = await redis.get(`ALL-TRANSACTIONS-${user._id.toString()}`)
                return res.status(200).json(JSON.parse(transactions))
            }

            const transactions = await Transaction.find({ ownedBy: user._id })
            await redis.setEx(`ALL-TRANSACTIONS-${user._id.toString()}`, 60 * 60, JSON.stringify(transactions))

            res.status(200).json(transactions)
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

        /**
     * @swagger
     * /api/transactions/{id}:
     *   get:
     *     summary: List of transactions
     *     tags:
     *       - Transaction
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: path
     *         name: id
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: List of transactions for user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 transaction:
     *                   type: object
     *                   properties:
     *                     _id:
     *                       type: string
     *                       example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *                     name:
     *                       type: string
     *                       example: transaction 1
     *                     value:
     *                       type: number
     *                       example: 1300
     *                     category:  
     *                       type: string
     *                       example: Entertainment
     *                     receiver:
     *                       type: boolean
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
            const transactionID = req.params.id
            const transaction = await Transaction.findOne({ _id: transactionID })
            
            if (!transaction) return res.status(404).json({ message: 'Transaction doesn\'t exist' })

            // Verify user ownership
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            if (transaction.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })

            res.status(200).json(transaction)
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    /**
     * @swagger
     * /api/transactions/new/:
     *   post:
     *     summary: Create new transaction
     *     tags:
     *       - Transaction
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
     *                 example: transaction 1
     *               value:
     *                 type: number
     *                 example: 1300
     *               category:  
     *                 type: string
     *                 example: Entertainment
     *               receiver:
     *                 type: boolean
     *     responses:
     *       201:
     *         description: New transaction created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Transaction created
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
            const { name, value, receiver, category } = req.body

            // Fetch user ID
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            const userID = user._id

            const newTransaction = new Transaction({
                name: name,
                ownedBy: userID,
                value: value,
                receiver: receiver,
                category: category
            })

            await newTransaction.save()
            await redis.del(`ALL-TRANSACTIONS-${user._id.toString()}`)

            res.status(201).json({ message: 'Transaction created' })
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

        /**
     * @swagger
     * /api/transactions/edit/{id}:
     *   put:
     *     summary: Create new transaction
     *     tags:
     *       - Transaction
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: path
     *         name: id
     *         required: true
     *         type: string
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: transaction 1
     *               value:
     *                 type: number
     *                 example: 1300
     *               category:  
     *                 type: string
     *                 example: Entertainment
     *               receiver:
     *                 type: boolean
     *     responses:
     *       201:
     *         description: Updated transaction
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Transaction edited
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
            const transactionID = req.params.id
            
            // Verify user ownership
            const { username } = req.user
            const transaction = await Transaction.findOne({ _id: transactionID })
            if (!transaction) return res.status(404).json({ message: 'Transaction doesn\'t exist' })

            const user = await User.findOne({ username: username }).select('_id')
            if (transaction.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })
            
            await Transaction.findOneAndUpdate({ _id: transactionID }, req.body)
            await Transaction.findOneAndUpdate({ _id: transactionID }, { 'updatedAt': Date.now() })
            await redis.del(`ALL-TRANSACTIONS-${user._id.toString()}`)

            res.status(200).json({ message: 'Transaction edited' })
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

            /**
     * @swagger
     * /api/transactions/delete/{id}:
     *   delete:
     *     summary: Create new transaction
     *     tags:
     *       - Transaction
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: path
     *         name: id
     *         required: true
     *         type: string
     *     responses:
     *       201:
     *         description: Deleted transaction
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Transaction deleted
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
            const transactionID = req.params.id
            
            // Verify user ownership
            const { username } = req.user
            const transaction = await Transaction.findOne({ _id: transactionID })
            if (!transaction) return res.status(404).json({ message: 'Transaction doesn\'t exist' })

            const user = await User.findOne({ username: username }).select('_id')
            if (transaction.ownedBy.toString() !== user._id.toString()) return res.status(401).json({ message: 'Unauthorized access' })

            await Transaction.findOneAndDelete({ _id: transactionID })
            await redis.del(`ALL-TRANSACTIONS-${user._id.toString()}`)

            res.status(200).json({ message: 'Transaction deleted' })
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    return router
}