// Used to prevent SQL injection
const format = require('pg-format');

module.exports = (app, client) => {

    let PATH = __filename.split('/routes')[1];
    PATH = PATH.split(PATH.includes('index.js') ? 'index.js' : '.js')[0];

    app.get(PATH, (req, res) => {

        const query = format('SELECT * FROM table;');

        client.query(query).then(result => {

            return res.json({
                rows: result.rows,
            });

        });

    });

}
