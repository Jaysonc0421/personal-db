# Personal Database
This repository contains the web server that is used to communicate with my personal database.

If you wish to use this codebase for your own database, see [installation.](#installation)

## Installation
- `git clone https://github.com/Jaysonc0421/personal-db`
- `cd personal-db`
- `npm i`
- `npm start` to run the application.

The default port is 3001.

A password is required to receive an authentication token for accessing the server. See [configuration.](#configuration)

### Configuration
The most easily configurable parts of this project are the environment variables. These are located in the `.env` file.

Configurable Env. Variables include:
- `PASSWORD` (required)
- `PORT`
