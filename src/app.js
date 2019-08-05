'use strict';

// 3rd Party Resources
const cwd = process.cwd();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require( './error-handlers/500.js');
const notFound = require( './error-handlers/404.js' );
const authRouter = require( './routes/router.js' );
const newroutes = require('./routes/newroutes.js');
// Prepare the express app
const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Routes
app.use('/', express.static(`${cwd}/docs`));
app.use('/docs', express.static(`${cwd}/docs`));
app.use(authRouter);
app.use(newroutes);

// Catchalls
app.use(notFound);
app.use(errorHandler);

let isRunning = false;

module.exports = {
  server: app,
  start: (port) => {
    if( ! isRunning ) {
      app.listen(port, () => {
        isRunning = true;
        console.log(`Server Up on ${port}`);
      });
    }
    else {
      console.log('Server is already running');
    }
  },
};
