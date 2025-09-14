const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema({
    'date-creation': {
        type: Date,
    },
    'goalname': {
        type: String,
        require: true
    },
    'ownedBy': {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    'requiredmoney': {
        type: Number,
        require: true
    },
    'completed': {
        type: Boolean,
        default: false,
        require: true
    }
})

const Goal = mongoose.model('Goal', goalSchema)
module.exports = Goal