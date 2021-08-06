# Personal Database
This repository contains the web server that is used to communicate with my personal database.

## Installation

### Node.js Application
- `git clone https://github.com/Jaysonc0421/personal-db`
- `cd personal-db`
- `npm i`
- `npm start` to run the application.

Default values (if not defined in `.env`):
```py
PORT=3001
PASSWORD=abc123
```

### PostgreSQL Database
This web server uses the [PostgreSQL](https://www.postgresql.org/about/) DBMS.

For information on setting up the database, follow the official tutorial [here.](https://www.postgresqltutorial.com/)

If no variables are provided in `.env`, the Node.js `pg` module will use the following default values: 
```py
PGHOST='localhost'
PGUSER=process.env.USER
PGDATABASE=process.env.USER
PGPASSWORD=null
PGPORT=5432
```
