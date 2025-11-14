const mongoose = require('mongoose')
const { Schema } = mongoose

const noteSchema = new Schema({
    'dateCreation': {
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
    'dateUpdate': {
        type: Date,
        default: Date.now
    }
})

const Note = mongoose.model('Note', noteSchema)
module.exports = Note