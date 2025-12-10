const mongoose = require('mongoose')
const { Schema } = mongoose

const transactionSchema = new mongoose.Schema({
    'name': {
        type: String,
        require: true
    },
    'ownedBy': {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    'value': {
        type: Number,
        require: true
    },
    'category': {
        type: String,
        require: true
    },
    'receiver': {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true
})

const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports = Transaction