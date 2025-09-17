const mongoose = require('mongoose')
const { Schema } = mongoose

const transactionSchema = new mongoose.Schema({
    'date-creation': {
        type: Date,
        default: Date.now
    },
    'name': {
        type: String,
        require: true
    },
    'ownedBy': {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    'price': {
        type: Number,
        require: true
    },
    'receiver': {
        type: Boolean,
        default: true,
    }
})

const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports = Transaction