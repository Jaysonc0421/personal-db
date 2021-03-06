const path = require('path');

// Load environment variables
require('dotenv').config();

/*

Connect to the PostgreSQL

*/
const { Client } = require('pg');

// Connection information is retrieved from the environment variables
const client = new Client();
client.connect();

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
app.tokens = [];

// This function is called when a request is made to any path on the server
app.use((req, res, next) => {

    try {

        // Do not require authentication unless the app is ran with APPENV set to production
        if(!process.env.APPENV || process.env.APPENV !== 'production') return next();

        // Make an exception for the endpoint used to request a token
        if(req.originalUrl === '/token') return next();

        // For every other endpoint, check if a valid token is provided
        const provided = ('authorization' in req.headers);
        const valid = (provided && app.tokens.includes(req.headers.authorization.split('Bearer ')[1]));

        if(!provided || !valid) return res.status(403).json({
            error: (provided) ? 'Invalid token' : 'Required header: authorization',
        });

        next();

    } catch (err) {

        console.log(err);
        res.status(500).json({
            error: 'An internal server error has occured.',
        });

    }

});

/*

Automatically mount files in the routes directory

*/
const { readdirSync, lstatSync } = require('fs');

const mount = (dir) => {

    const contents = readdirSync(dir);

    for(const item of contents) {

        const item_path = path.join(dir, item);
        const stats = lstatSync(item_path);

        if(stats.isDirectory()) {

            // Recursively mount files inside of nested directories
            mount(item_path);

        } else if(stats.isFile()) {

            require(item_path)(app, client);

            const PATH = item_path.split('/routes')[1].split(item_path.includes('index.js') ? 'index.js' : '.js')[0];
            console.log(`Mounted: ${ PATH }`);

        }

    }

}

mount(path.join(__dirname, './routes'));

/*

Start listening

*/
const PORT = process.env.PORT || 3001;
const APP_ENV = process.env.APPENV || 'development';

app.listen(PORT);
console.log(`\nListening on port ${ PORT }. \nRunning in ${ APP_ENV } environment.`);
