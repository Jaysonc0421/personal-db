// Used to prevent SQL injection
const format = require('pg-format');

module.exports = (app, client) => {

    const PATH = __filename.split('/routes')[1].split('.js')[0];

    app.get(PATH, (req, res) => {

        try {

            const query = format('');

            client.query(query).then(result => {

                return res.json({
                    rows: result.rows,
                });

            });

        } catch(err) {

            console.log(err);

            return res.status(500).json({
                error: 'An internal server error has occured.',
            });

        }

    });


}
