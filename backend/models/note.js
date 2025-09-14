const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    'date-creation': {
        type: Date,
    },
    'title': {
        type: String,
        require: true
    },
    'ownedBy': {
        type: Schema.Types.ObjectID,
        ref: 'User'
    },
    'content': {
        type: String,
        require: true
    },
    'last-edit-date': {
        type: Date,
    }
})

const Note = mongoose.model('Note', noteSchema)
module.exports = Note