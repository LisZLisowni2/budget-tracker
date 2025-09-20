const express = require('express')
const User = require('../models/user')
const Transaction = require('../models/transaction')
const authorization = require('../utils/authorization')

const router = express.Router()

module.exports = (config, redis) => {
    const Auth = authorization(config, redis)

    router.get('/all', Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            
            const transactions = await Transaction.find({ ownedBy: user._id })

            res.status(200).json(transactions)
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

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
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    router.post('/new', Auth.authenticateToken, async (req, res) => {
        try {
            const { name, price, receiver } = req.body

            // Fetch user ID
            const { username } = req.user
            const user = await User.findOne({ username: username }).select('_id')
            const userID = user._id

            const newTransaction = new Transaction({
                name: name,
                ownedBy: userID,
                price: price,
                receiver: receiver
            })

            await newTransaction.save()

            res.status(201).json({ message: 'Transaction created' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

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
            await Transaction.findOneAndUpdate({ _id: transactionID }, { 'last-edit-date': Date.now() })

            res.status(200).json({ message: 'Transaction edited' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

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

            res.status(200).json({ message: 'Transaction deleted' })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    })

    return router
}