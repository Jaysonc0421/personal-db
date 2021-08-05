const path = require('path');

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
}));

app.use(express.json());

app.get('/', (req, res) => {
    return res.send('Hello world!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Listening on port ${ PORT }`);
