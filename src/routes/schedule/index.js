const format = require('pg-format');

const columns = [
    {
        name: 'label',
        required: true,
        regex: /\w+/,
    },
    {
        name: 'type',
        required: false,
        regex: /\w+/,
    },
    {
        name: 'description',
        required: false,
        regex: /\w+/,
    },
    {
        name: 'start_time',
        required: true,
        regex: /\d{4}-\b(0[1-9]|1[0-2])\b-\b(0[1-9]|[12][0-9]|3[01])\b \b(0[0-9]|1[0-9]|2[0-3])\b:[0-5][0-9]:[0-5][0-9]/,
    },
    {
        name: 'end_time',
        required: true,
        regex: /\d{4}-\b(0[1-9]|1[0-2])\b-\b(0[1-9]|[12][0-9]|3[01])\b \b(0[0-9]|1[0-9]|2[0-3])\b:[0-5][0-9]:[0-5][0-9]/,
    },
];

let PATH = __filename.split('/routes')[1];
PATH = PATH.split(PATH.includes('index.js') ? 'index.js' : '.js')[0];

module.exports = (app, client) => {

    // Returns a list of scheduled tasks
    app.get(PATH, (req, res) => {

        const query = 'SELECT * FROM schedule;';

        client.query(query).then(result => res.json({
            tasks: result.rows,
        }));

    });

    // Create a new task
    app.post(PATH, (req, res) => {

        const provided_columns = columns.filter(col => col.name in req.body).map(col => col.name);
        
        // Validate and check existence of data
        for(const col of columns) {

            // If the column is not required, and is not provided, skip the following checks
            if(!col.required && !(col.name in req.body)) continue;

            // If the column is required, check if it was provided
            if(col.required && !(col.name in req.body)) return res.status(400).json({
                error: `Required json: ${ col.name }`,
            });

            // Check the value using regular expressions
            if(col.regex && (typeof req.body[col.name] !== 'string' || !col.regex.test(req.body[col.name]))) return res.status(400).json({
                error: `An invalid ${ col.name } was provided.`,
            });

        }

        const cols = provided_columns.join(', ');
        const values = provided_columns.map(col => format('%L', req.body[col])).join(', ');

        const query = `INSERT INTO schedule(${ cols }) VALUES (${ values }) RETURNING *;`;

        client.query(query).then(result => {

            const success = (result.rowCount > 0);

            const status = success ? 201 : 400;
            const key = success ? 'new_task' : 'error';
            const value = success ? result.rows[0] : 'An error has occured with the query.';

            return res.status(status).json({ [key]: value });

        });

    });

    // Modify an existing task
    app.patch(PATH + ':id', (req, res) => {

        // A task id is required and must be an integer
        if(!/\d+/.test(req.params.id)) return res.status(400).json({
            error: 'The task id must be an integer.',
        });

        const provided_columns = columns.filter(col => col.name in req.body).map(col => col.name);

        // Require a value of the task is actually changed
        if(provided_columns.length === 0) return res.status(400).json({
            error: 'Atleast one value must be modified.',
        });

        // Validate and check existence of data
        for(const col of columns) {

            // If the column is not provided, skip the following checks
            if(!provided_columns.includes(col.name)) continue;

            // Check the value using regular expressions
            if(col.regex && (typeof req.body[col.name] !== 'string' || !col.regex.test(req.body[col.name]))) return res.status(400).json({
                error: `An invalid ${ col.name } was provided.`,
            });

        }

        const values = provided_columns.map(col => format('%I = %L', col, req.body[col]));
        const query = format(`UPDATE schedule SET ${ values } WHERE id = %L RETURNING *;`, parseInt(req.params.id));

        client.query(query).then(result => {

            const success = (result.rowCount > 0);

            const status = success ? 200 : 404;
            const key = success ? 'updated_task' : 'error';
            const value = success ? result.rows[0] : 'The requested task doesn\'t exist.';

            return res.status(status).json({ [key] : value });

        });

    });

    // Delete an existing task 
    app.delete(PATH + ':id', (req, res) => {

        // A task id is required and must be an integer
        if(!/\d+/.test(req.params.id)) return res.status(400).json({
            error: 'The task id must be an integer.',
        });

        const query = format('DELETE FROM schedule WHERE id = %L RETURNING *;', parseInt(req.params.id));

        client.query(query).then(result => {

            const success = (result.rowCount > 0);

            const status = success ? 200 : 404;
            const key = success ? 'deleted_task' : 'error';
            const value = success ? result.rows[0] : 'The requested task doesn\'t exist.';

            res.status(status).json({ [key] : value });

        });

    });

}
