'use strict';

const config = require('../config');
const uuid = require('uuid');

const logger = require('pino')(config.getLogConfig());

let AWS = require('aws-sdk');
AWS.config.update(config.getAWSConfig())

module.exports.putDynamo = async (message_attributes) => {

    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    var params = {
        TableName: 'Apps_request_log',
        Item: { }
    };
    for( const key in message_attributes ) {
        params.Item[key] = {S:message_attributes[key]};
    }
    params.Item.id = {S:uuid.v1()};
    params.Item.datetime = {S:new Date().toISOString()};

    try {
        let result = await ddb.putItem(params).promise();
    } catch (err) {
        logger.error(err,"Dynamo error request_log:putDynamo");
    }

}