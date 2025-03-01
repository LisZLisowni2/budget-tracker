require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');

const app = express();
const PORT = process.env.Port || 3000;
const ADDRESS = proccess.env.Address || '0.0.0.0';
const config = {
    MongoDB_URI: process.env.MongoURI,
    RedisDB_URI: process.env.RedisURI,
    JWT_Secret: proccess.env.JWTSecret,
    Port: PORT,
    Address: ADDRESS,
}

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