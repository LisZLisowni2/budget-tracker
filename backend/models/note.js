const mongoose = require('mongoose')
const { Schema } = mongoose

const noteSchema = new Schema({
    'date-creation': {
        type: Date,
        default: Date.now
    },
    'title': {
        type: String,
        require: true
    },
    'ownedBy': {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    'content': {
        type: String,
        require: true
    },
    'last-edit-date': {
        type: Date,
        default: Date.now
    }
})

const Note = mongoose.model('Note', noteSchema)
module.exports = Note