const express = require('express');
require('dotenv').config();

const path = require('path');
const app = express();
const hostname = "::";
const port = process.env.port;
const redirection_path = process.env.redirection_path
const root_path = process.env.root_path

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, hostname, () => {
    console.info(`port: ${port}`);
    console.info(`redirection_path: ${redirection_path}`);
    console.info(`root_path: ${root_path}`);
    console.info(`server running at http://${hostname}:${port}/`);
});
