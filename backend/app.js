const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const mongoose = require('mongoose')
const redis = require('redis')
const secretRead = require('./utils/secret')

const app = express();
const PORT = process.env.Port || 3000;
const ADDRESS = proccess.env.Address || '0.0.0.0';
const JWT_Secret = secretRead('jwt_token');
const config = {
    MongoDB_URI: 'mongodb://database:27017/',
    RedisDB_URI: 'redis://redis:6379',
    JWT_Secret: JWT_Secret,
    Port: PORT,
    Address: ADDRESS,
}

let redisClient

(async () => {
    redisClient = redis.createClient({
        url: config.RedisDB_URI
    })

    redisClient.on('error', (error) => {
        console.error(`Error: ${error}`)
    })

    await redisClient.connect();

    console.log("Connected to Redis DB");
})

mongoose.connect(config.MongoDB_URI);

const mongoClient = mongoose.connection
mongoClient.on('error', () => {
    console.error.bind(console, ("Connection error: "))
})
mongoClient.once('open', () => {
    console.log("Connected to MongoDB");
})

const userRouter = require('./routers/user')(config)

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["*"], // Temporary
    credentials: true
}))
app.use('/users', userRouter)

app.listen(PORT, ADDRESS, () => {
    console.log(`Server running at http://${ADDRESS}:${PORT}`)
})