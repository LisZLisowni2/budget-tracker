const express = require('express')
const User = require('../models/user')
const router = express.Router();

module.exports = (config) => {
    const authorization = require('../utils/authorization')(config)

    return router;
}