require('dotenv').config();

const express = require('express');

const app = express();
const PORT = 3000;
const ADDRESS = '0.0.0.0';
const config = {
    MongoDB_URI: process.env.MongoURI,
    RedisDB_URI: process.env.RedisURI
}
app.use(express.json());

app.listen(PORT, ADDRESS, () => {
    console.log(`Server running at http://${ADDRESS}:${PORT}`)
})