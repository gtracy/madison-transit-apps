'use strict';

let config = require('../config');
const logger = require('pino')(config.getLogConfig());
let AWS = require('aws-sdk');
AWS.config.update(config.getAWSConfig());
let ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


module.exports.checkPaywall = async (number) => {
    try {
        let params = {
            TableName: "SMS_subscribers",
            Key : {
                subscriber: {S : number}
            }
        };
        let aws_result = await ddb.getItem(params).promise();

        if( aws_result.Item) {
            logger.info('number valid!');
            return true;
        } else {
            logger.info('failed to lookup number '+number);
            return false;
        }

    } catch(err) {
        logger.error(err);
        return false;
    }

}