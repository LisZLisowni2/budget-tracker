const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const mongoose = require('mongoose')
const redis = require('redis')
const secretRead = require('./utils/secret')
const fs = require('fs')
const https = require('https')

// Beka
let RedisDB_URI = 'redis://redis:6379'
let MongoDB_URI
let mongodbClient
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
    Address: ADDRESS
}

secretRead('db_password')
.then((res) => {
    MongoDB_URI = `mongodb://root:${res}@database:27017/myapp?authSource=admin`
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

    mongodbClient = db
}).catch((err) => {
    console.error.bind(err, "Error: ")
})

secretRead('redis_password')
.then(async (res) => {
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

let attempts = 60;
const intervalUserRouter = setInterval(() => {
    if (attempts < 0) {
        clearInterval(intervalUserRouter)
        throw new Error("Failed to connect")
    }
    if (redisClient && JWT_Secret && mongodbClient) {
        const userRouter = require('./routers/user')(config, redisClient)
        const noteRouter = require('./routers/note')(config, redisClient)
	app.use('/users', userRouter)
	app.use('/notes', noteRouter)
        clearInterval(intervalUserRouter)
        console.log("Attach the user router")
    } else {
        console.log(`RedisClient, MongoDB or JWT Secret not present. Retry, remaining attempts: ${attempts}`)
    }
    attempts -= 1
}, 1000)

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true
}))

const options = {
    key: fs.readFileSync("./cert/backend.key"),
    cert: fs.readFileSync("./cert/backend.crt")
}

const httpsServer = https.createServer(options, app)

httpsServer.listen(PORT, ADDRESS, () => {
    console.log(`App listening on https://${ADDRESS}:${PORT}`)
})
