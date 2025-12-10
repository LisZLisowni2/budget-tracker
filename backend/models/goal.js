const mongoose = require('mongoose')
const { Schema } = mongoose

const goalSchema = new mongoose.Schema({
    'name': {
        type: String,
        require: true
    },
    'ownedBy': {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    'requiredValue': {
        type: Number,
        require: true
    },
    'isCompleted': {
        type: Boolean,
        default: false,
        require: true
    }
}, {
    timestamps: true
})

const Goal = mongoose.model('Goal', goalSchema)
module.exports = Goal