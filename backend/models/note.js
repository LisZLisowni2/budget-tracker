const mongoose = require('mongoose')
const { Schema } = mongoose

const noteSchema = new Schema({
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
}, {
    timestamps: true
})

const Note = mongoose.model('Note', noteSchema)
module.exports = Note