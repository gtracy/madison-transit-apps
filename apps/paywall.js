'use strict';

let config = require('../config');
const logger = require('pino')(config.getLogConfig());
let AWS = require('aws-sdk');
AWS.config.update(config.getAWSConfig());
let ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const twilio = require('twilio');


module.exports.checkPaywall = async (number) => {
    try {
        let params = {
            TableName: "SMS_subscribers",
            Key : {
                subscriber: {S : number}
            }
        };
        let aws_result = await ddb.getItem(params).promise();

        // 1  : valid number for replies
        // 0  : new user for a free trial
        // -1 : invalid number
        //
        if( aws_result.Item ) {
            console.dir(aws_result.Item);
            // check if they've paid and are in their subscription window
            if( aws_result.Item.paid && aws_result.Item.paid.BOOL === true ) {
                let end_date = new Date(aws_result.Item.expiration.S);
                logger.info('end date: ' + end_date);
                if( end_date < Date.now() ) {
                    logger.info("caller's subscription has expired: "+end_date);
                    return -1;
                } else {
                    logger.info('number valid');
                    return 1;
                }
            } else if( aws_result.Item.requests.N < 5 ) {
                // unpaid, but they are still getting free requests
                logger.info('unpaid but they are receiving free trial still');
                return 1;
            } else {
                // valid number but they have not paid and are out of free messages
                logger.info('unpaid and free trial has ended');
                return -1;
            }
        } else {
            // we have a virgin user! welcome them and give them a few free requests
            logger.info('failed to lookup number '+number);
            return 0;
        }

    } catch(err) {
        logger.error(err);
        return false;
    }

}

module.exports.welcomeNewCaller = async (number) => {
    let welcome_msg = "Welcome to SMSMyBus! The first five requests are complimentary, but going forward you will need to signup. Please visit smsmybus.com to learn more.";
    const client = new twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
        { logLevel: 'info' }
    );
    client.messages.create({
        body: welcome_msg,
        from: config.twilioServiceNumber,
        to: number
    }).then(message => logger.info(message.sid));

    
}