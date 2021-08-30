const format = require('pg-format');

module.exports = (app, client) => {

    let PATH = __filename.split('/routes')[1];
    PATH = PATH.split(PATH.includes('index.js') ? 'index.js' : '.js')[0];

    const columns = ['first', 'middle', 'last', 'phones', 'emails', 'urls', 'socials', 'notes'];
    const json_columns = ['phones', 'emails', 'urls', 'socials'];

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
        if(!('first' in req.body) || req.body.first.length === 0) return res.status(400).json({
            error: 'Required json: first',
        });

        const provided_columns = columns.filter(col => col in req.body);

        // Determine if provided json columns are infact objects
        for(const col of json_columns) {

            const isObject = (typeof req.body[col] !== 'object');
            const isArray = Array.isArray(req.body[col]);

            if(provided_columns.includes(col) && (isObject || isArray)) return res.status(400).json({
                error: `${ json_columns.join(', ') } must be a json object.`,
            });

        }

        // If the provided value is not a json column, and is not provided as a string
        // parse it as one to prevent incorrect datatype errors.
        for(const col of provided_columns) {

            const type = (typeof req.body[col]);

            if(json_columns.includes(col) && type === 'string') req.body[col] = JSON.stringify(req.body[col]);

        }

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

        // The contact id must be parseable as an integer
        if(!parseInt(req.params.id)) return res.status(400).json({
            error: 'The contact id must be an integer.',
        });

        const provided_columns = columns.filter(col => col in req.body);

        if(provided_columns.length === 0) return res.status(400).json({
            error: 'Atleast one value must be modified.',
        });

        // If the first name is updated, check if it is atleast one character in length
        if('first' in req.body && req.body.first.length === 0) return res.status(400).json({
            error: 'A contact must include a first name.',
        }); 

        // Determine if provided json columns are infact objects
        for(const col of json_columns) {

            const isObject = (typeof req.body[col] !== 'object');
            const isArray = Array.isArray(req.body[col]);

            if(provided_columns.includes(col) && (isObject || isArray)) return res.status(400).json({
                error: `${ json_columns.join(', ') } must be a json object.`,
            });

        }

        // If the provided value is not a json column, and is not provided as a
        // string, parse it as one to prevent incorrect datatype errors.
        for(const col of provided_columns) {

            const type = (typeof req.body[col]);

            if(json_columns.includes(col) && type === 'string') req.body[col] = JSON.stringify(req.body[col]);

        }

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

        // The contact id must be parseable as an integer
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
