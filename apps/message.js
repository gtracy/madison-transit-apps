'use strict';

require('dotenv').config();
const config = require('../config');
const logger = require('pino')(config.getLogConfig());
const twilio = require('twilio');
const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    { logLevel: 'debug' }
    );

module.exports = async function(app) {

    app.post('/message', twilio.webhook({protocol:'https'}), async (req,res) => {
        console.dir(req.body);

        // who called? and what did they ask for?
        logger.info(req.body.From);

        // scan paywall

        // interrogate the message body to determine what to do
        // - help 
        // - bus request
        logger.info(req.body.Body);

        // log the request

        // respond
        res.set('Content-Type', 'text/xml');
        res.send('it worked');
    });

}