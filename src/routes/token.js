const path = require('path');
const { randomBytes } = require('crypto');

module.exports = (app, client) => {

    let PATH = __filename.split('/routes')[1];
    PATH = PATH.split(PATH.includes('index.js') ? 'index.js' : '.js');

    app.post(PATH, (req, res) => {

        // Check if the correct password is provided
        const provided = ('password' in req.body);
        const valid = ('password' in req.body && req.body.password === process.env.PASSWORD);

        if(!provided || !valid) return res.status(403).json({
            error: (provided) ? 'Incorrect password' : 'Required json: password',
        });

        // Generate a token. Just in case, make sure it does not already exist
        let token = randomBytes(32).toString('hex');
        while(app.tokens.includes(token)) token = randomBytes(32).toString('hex');

        app.tokens.push(token);

        return res.json({ token: token });

    });

}
