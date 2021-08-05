const path = require('path');

// Load environment variables
require('dotenv').config();

/*

Initialize the express application

*/
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
}));

app.use(express.json());

/*

Handle authentication

Some information accessible via this web server is private, and therefore
must be protected by an authentication process.

*/

// Every time the server is restarted, new tokens must be requested by clients
const { randomBytes } = require('crypto');

app.tokens = [];

// This function is called when a request is made to any path on the server
app.use((req, res, next) => {

    // Make an exception for the endpoint used to request a token
    if(req.originalUrl === '/token') return next();

    // For every other endpoint, check if a valid token is provided
    const provided = ('authorization' in req.headers);
    const valid = (provided && app.tokens.includes(req.headers.authorization.split('Bearer ')[1]));

    if(!provided || !valid) return res.status(403).json({
        success: false,
        message: (provided) ? 'Invalid token' : 'Required header: authorization',
    });

    next();

});

// Generate new tokens for client applications
app.post('/token', (req, res) => {

    // Check if the correct password is provided
    const provided = ('password' in req.body);
    const valid = ('password' in req.body && req.body.password === process.env.PASSWORD);

    if(!provided || !valid) return res.status(403).json({
        success: false,
        message: (provided) ? 'Incorrect password' : 'Required json: password',
    });

    // Generate a token. Just in case, make sure it does not already exist
    let token = randomBytes(32).toString('hex');
    while(app.tokens.includes(token)) {
        token = randomBytes(32).toString('hex');
    }

    app.tokens.push(token);

    res.json({
        success: true,
        token: token,
    });

});

/*

Start listening

*/
const PORT = process.env.PORT || 3001;

app.listen(PORT);
console.log(`Listening on port ${ PORT }`);
