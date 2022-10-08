'use strict';

const got = require('got');

require('dotenv').config();
const config = require('../config');
const logger = require('pino')(config.getLogConfig());
const twilio = require('twilio');
const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    { logLevel: 'debug' }
);
const { MessagingResponse } = require('twilio').twiml;

module.exports = async function(app) {

    app.post('/message', twilio.webhook({protocol:'https'}), async (req,res) => {
        const twiml = new MessagingResponse();

        const caller = req.body.From;
        const msg = req.body.Body;
        let response = '';
        logger.info(`Inbound request from ${caller}: ${msg}`);

        // scan paywall

        // interrogate the message body to determine what to do
        // - help 
        // - bus request
        if( msg.toLowerCase() === "help" ) {
            response = "Bus arrival requests are either, stopID -or- routeID stopID  Send 'parking' to find parking details";
        } else {
            const api_response = await got(`https://api.smsmybus.com/v1/getarrivals?key=${process.env.METRO_API_KEY}&stopID=${msg}`).json();
            if( api_response.status > -1 ) {

                // build a response with the first three results
                for( let i=0; i < api_response.stop.route.length; i++ ) {
                    const r = api_response.stop.route[i];
                    response += `Route ${r.routeID} in ${r.minutes} mins toward ${r.destination.toLowerCase()}  `;
                    if( i >= 2 ) break;
                };
                twiml.message(response);
            }
        }

        // log the request

        // respond
        logger.info('response: ' + response);
        res.type('text/xml').send(twiml.toString());
    });

}