const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    'date-creation': {
        type: Date,
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