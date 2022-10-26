'use script';

module.exports = {

    getPort : function getPort() {
        return 3300
    },

    getEnv : function getEnv() {
        if( process.env.NODE_ENV === 'prod' ) {
            return process.env.NODE_ENV;
        } else {
            return 'dev';
        }
    },

    getQueue : function getQueue() {
        if( module.exports.getEnv() === 'prod' ) {
            return 'fixme-prod-queue';
        } else {
            return 'fixme-dev-queue';
        }
    },
    
    getLogConfig : function getLogConfig() {
        let level = 'info';
        if( process.env.LOG_LEVEL ) {
            level = process.env.LOG_LEVEL;
        } else if( module.exports.getEnv() === 'dev' ) {
            level = 'debug';
        }

        return({
            level: level,

        });
    },

    getAWSConfig : function getAWSConfig() {
        if( process.env.NODE_ENV === 'prod' ) {
            return {
                region : 'us-east-2',
                access_id : process.env.AWS_ACCESS_ID,
                access_secret : process.env.AWS_ACCESS_SECRET
            }
        } else {
            return {
                region : 'local',
                endpoint : 'http://localhost:8000'
            }
        }
    },

    requestLogEnabled : function requestLogEnabled() {
        if( process.env.REQUEST_LOG === 'true' ) {
            return true;
        } else {
            return false;
        }
    },

    twilioServiceNumber : '+16088074309'
}