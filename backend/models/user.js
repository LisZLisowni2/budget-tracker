const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    'username': {
        type: String,
        require: true,
        unique: true
    },
    'email': {
        type: String,
        require: true,
        unique: true
    },
    'phone': {
        type: String,
    },
    'password': {
        type: String,
        require: true
    },
    'scope': {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    'baseCurrency': {
        type: String,
        require: true,
        default: 'USD'
    },
    'isVerifed': {
        type: Boolean,
        default: false
    },
    'lastLogin': {
        type: Date
    },
    'preferredLanguage': {
        type: String,
        default: 'en'
    }
}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema)
module.exports = User