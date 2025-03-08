const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const mongoose = require('mongoose')
const redis = require('redis')
const secretRead = require('./utils/secret')

let RedisDB_URI = 'redis://redis:6379'
let MongoDB_URI
let JWT_Secret
let redisClient

secretRead('jwt_token')
.then((res) => {
    JWT_Secret = res;
}).catch((err) => {
    console.error.bind(err, "Error: ")
})

const app = express();
const PORT = process.env.Port || 3000;
const ADDRESS = process.env.Address || '0.0.0.0';

const config = {
    JWT_Secret: JWT_Secret,
    Port: PORT,
    Address: ADDRESS,
}

secretRead('db_password')
.then((res) => {
    MongoDB_URI = `mongodb://root:${res}@database:27017/myapp?authSource=admin`
    console.log(MongoDB_URI)
    mongoose.connect(MongoDB_URI)
    const db = mongoose.connection
    db.on('error', (error) => {
        console.error.bind(error, "Error: ")
    })
    db.on('open', () => {
        console.log("Connected to MongoDB")
    })
    db.on('disconnected', () => {
        console.log("Disconnected from MongoDB")
    })
}).catch((err) => {
    console.error.bind(err, "Error: ")
})

secretRead('redis_password')
.then(async (res) => {
    console.log(`Redis password: ${res}`)
    RedisDB_URI = `redis://redis:6379`
    redisClient = redis.createClient({
        url: RedisDB_URI,
        password: res.trim(),
        username: 'default'
    })

    redisClient.on('error', (error) => {
        console.error(`Error: ${error}`)
    })

    await redisClient.connect();

    console.log("Connected to RedisDB");
}).catch((err) => {
    console.error.bind(err, "Error: ")
})

const userRouter = require('./routers/user')(config, redisClient)

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