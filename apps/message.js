'use strict';

const got = require('got');

require('dotenv').config();
const config = require('../config');
const logger = require('pino')(config.getLogConfig());
const paywall = require('./paywall');
const req_logger = require('./request_log');

const twilio = require('twilio');
const { MessagingResponse } = require('twilio').twiml;

module.exports = async function(app) {

    app.post('/message', twilio.webhook({protocol:'https'}), async (req,res) => {
        const twiml = new MessagingResponse();

        const caller = req.body.From;
        const msg = req.body.Body;
        let api_response;
        let response = '';
        logger.info(`Inbound request from ${caller}: ${msg}`);

        // scan paywall
        const payment = await paywall.checkPaywall(caller);
        logger.info('paywall check result: '+payment);
        if( payment < 0 ) {
            // not a valid number
            twiml.message('');
            logger.info('response: ' + response);
        } else {
            // valid number. 
            if( payment === 0 ) {
                // not a subscriber 
                // welcome them and give them some free requests.
                logger.info('new user! welcome them.');
                await paywall.welcomeNewCaller(caller);
            }

            // interrogate the message body to determine what to do
            // - help 
            // - bus request
            if( msg.toLowerCase() === "help" ) {
                response = "Bus arrival requests are either, stopID -or- routeID stopID";
            } else {
                // the bust request is either a single stop ID
                // or a route ID + stop ID
                // validate the request
                const message = msg.trim().split(' ');
                if( message.length > 2 ) {
                    logger.error('illegal request format from caller '+message);
                    response = 'Bus arrival requests are either, stopID -or- routeID stopID';
                } else if( message.length === 2 && message[0].length > 2 ) {
                    logger.error('illegal request format from caller '+message);
                    response = 'Requests should be routeID stopID and it looks like you gave me an invalide routeID';
                } else if( message.length === 1 && message[0].length > 4 ) {
                    logger.error('illegal request format from caller '+message);
                    response = 'The requested stopID should never be more than four digits long';
                } else if( message.length === 1 ) {
                    api_response = await got(`https://api.smsmybus.com/v1/getarrivals?key=${process.env.METRO_API_KEY}&stopID=${message[0]}`).json();
                } else if( message.length === 2 ) {
                    api_response = await got(`https://api.smsmybus.com/v1/getarrivals?key=${process.env.METRO_API_KEY}&routeID=${message[0]}&stopID=${message[1]}`).json();
                } else {
                    logger.error('illegal request format from caller '+message);
                    response = 'Bus arrival requests are either, stopID -or- routeID stopID';
                }

                if( api_response ) {
                    if( api_response.status > -1 ) {
                        if( api_response.stop.route.length === 0 ) {
                            response = 'Snap! No more buses coming that match your request';
                        } else {
                            // build a response with the first three results
                            for( let i=0; i < api_response.stop.route.length; i++ ) {
                                const r = api_response.stop.route[i];
                                response += `Route ${r.routeID} in ${r.minutes} mins toward ${r.destination.toLowerCase()}  `;
                                if( i >= 2 ) break;
                            };
                        }
                    } else {
                        logger.error('API fail.');
                        logger.error(api_response);
                        response = '';
                    }
                }
            }

            // respond
            twiml.message(response);
            logger.info('response: ' + response);
        }

        // log the request with caller
        await paywall.incrementCaller(caller);
        await req_logger.putDynamo({
            caller : caller,
            request : msg,
            results : response
        });

        res.type('text/xml').send(twiml.toString());

    });

}