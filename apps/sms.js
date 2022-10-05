'use strict';

const app = require("../app");

module.exports = async function(app) {

    app.get('/sms', async (req,res) => {

        // validate it is in fact coming from twilio

        // who called? and what did they ask for?

        // scan paywall

        // interrogate the message body to determine what to do
        // - help 
        // - bus request

        // log the request

        // respond
    });

}