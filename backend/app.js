const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const mongoose = require('mongoose')
const redis = require('redis')
const secretRead = require('./utils/secret')
const fs = require('fs')
const https = require('https')

let RedisDB_URI = 'redis://redis:6379'
let MongoDB_URI
let mongodbClient
let redisClient

const app = express();
const PORT = process.env.Port || 3000;
const ADDRESS = process.env.Address || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'production';

secretRead('db_password')
.then(async (res) => {
    MongoDB_URI = `mongodb://root:${res}@database:27017/myapp?authSource=admin`
    await mongoose.connect(MongoDB_URI)
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
    console.log(res.length)
    RedisDB_URI = `redis://default:${res}@redis:6379`
    redisClient = redis.createClient({
        url: RedisDB_URI,
    })

    redisClient.on('error', (error) => {
        console.error(`Error: ${error}`)
        console.error(`URI: ${RedisDB_URI}`)
    })

    await redisClient.connect();

    console.log("Connected to RedisDB");
    
}).catch((err) => {
    console.error.bind(err, "Error: ")
})

let attempts = 60;
const intervalUserRouter = setInterval(async () => {
    if (attempts < 0) {
        clearInterval(intervalUserRouter)
        if (NODE_ENV === "production") throw new Error("Failed to connect")
        else {
            const error = {
                database: mongodbClient,
                redis: redisClient,
            }
            throw new Error(error)
        }
    }
    if (redisClient && mongodbClient) {
        const JWTSECRET = await secretRead("jwt_token")
        const config = {
            JWT_Secret: JWTSECRET,
            Port: PORT,
            Address: ADDRESS,
            NODE_ENV: NODE_ENV
        }

        console.log("Attaching routers")
        const userRouter = require('./routers/user')(config, redisClient)
        const noteRouter = require('./routers/note')(config, redisClient)
        const goalRouter = require('./routers/goal')(config, redisClient)
        const transactionRouter = require('./routers/transaction')(config, redisClient)
        app.use('/users', userRouter)
        app.use('/notes', noteRouter)
        app.use('/goals', goalRouter)
        app.use('/transactions', transactionRouter)
        if (config.NODE_ENV === "test") {
            console.log(config)
            console.log("Attaching test router")
            const testRouter = require('./routers/test')()
            app.use('/test', testRouter)
        }
        clearInterval(intervalUserRouter)
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
