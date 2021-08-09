const format = require('pg-format');

module.exports = (app, client) => {

    let PATH = __filename.split('/routes')[1];
    PATH = PATH.split(PATH.includes('index.js') ? 'index.js' : '.js')[0];

    const columns = ['first', 'middle', 'last', 'phones', 'emails', 'urls', 'socials', 'notes'];

    // Return a list of contacts
    app.get(PATH, (req, res) => {

        const query = 'SELECT * FROM contacts;';

        client.query(query).then(result => res.json({
            contacts: result.rows,
        }));

    });

    // Create a new contact
    app.post(PATH, (req, res) => {

        // Require that a first name be provided
        if(!req.body.first) return res.status(400).json({
            error: 'Required json: first',
        });

        const provided_columns = columns.filter(col => col in req.body);
        const cols = provided_columns.join(', ');
        const values = provided_columns.map(col => format('%L', req.body[col])).join(', ');

        const query = `INSERT INTO contacts(${ cols }) VALUES (${ values }) RETURNING *;`;

        client.query(query).then(result => {

            const success = (result.rowCount > 0);

            const status = success ? 201 : 400;
            const key = success ? 'new_contact' : 'error';
            const value = success ? result.rows[0] : 'An error has occured with the query.';

            return res.status(status).json({ [key]: value });

        });

    });

    // Modify an existing contact
    app.patch(PATH + '/:id', (req, res) => {

        // A contact id is required
        if(!parseInt(req.params.id)) return res.status(400).json({
            error: 'The contact id must be an integer.',
        });

        const provided_columns = columns.filter(col => col in req.body);
        const values = provided_columns.map(col => format('%I = %L', col, req.body[col]));
        const query = format(`UPDATE contacts SET ${ values } WHERE id = %L RETURNING *;`, parseInt(req.params.id));

        client.query(query).then(result => {

            const success = (result.rowCount > 0);

            const status = success ? 200 : 404;
            const key = success ? 'updated_contact' : 'error';
            const value = success ? result.rows[0] : 'The requested contact doesn\'t exist.';

            return res.status(status).json({ [key] : value });

        });

    });

    // Delete an existing contact
    app.delete(PATH + '/:id', (req, res) => {

        // A contact id is required
        if(!parseInt(req.params.id)) return res.status(400).json({
            error: 'The contact id must be an integer.',
        });

        const query = format('DELETE FROM contacts WHERE id = %L RETURNING *;', parseInt(req.params.id));

        client.query(query).then(result => {

            const success = (result.rowCount > 0);

            const status = success ? 200 : 404;
            const key = success ? 'deleted_contact' : 'error';
            const value = success ? result.rows[0] : 'The requested contact doesn\'t exist.';

            res.status(status).json({ [key] : value });

        });

    });

}
