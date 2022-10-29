'use strict';

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('pino-http')(config.getLogConfig());

// request logger
let logger = (req,res,next) => {
    req.log.info(req.url,'new request');
    next();
}

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(pino);
app.use(logger);

// API endpoint registration
require('./apps/message')(app);

// API backstop
app.get('*', (req,res) => {
    res.json({
        "status": -1,
        "description": 'sorry. we do not support this endpoint.'
    });
});

// error handler
app.use( (err, req, res, next) => {
    res.json({
        "status": -1,
        "description": err
    });
});

module.exports = app;
