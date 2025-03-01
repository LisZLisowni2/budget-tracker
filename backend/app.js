const express = require('express');

const app = express();
const PORT = 3000;
const ADDRESS = '0.0.0.0';
app.use(express.json());

app.listen(PORT, ADDRESS, () => {
    console.log(`Server running at http://${ADDRESS}:${PORT}`)
})