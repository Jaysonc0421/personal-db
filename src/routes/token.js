const path = require('path');
const { randomBytes } = require('crypto');

module.exports = (app, client) => {

    const PATH = __filename.split('/routes')[1].split('.js')[0];

    app.post(PATH, (req, res) => {

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


}
