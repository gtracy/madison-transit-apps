'use strict'

const config = require('./config');
const app = require('./app');
const logger = require('pino')(config.getLogConfig());

app.listen(config.getPort(), () => {
    logger.info('app running in ' + config.getEnv());
    logger.info('logger set to '+config.getLogConfig().level);
    logger.info(config.getAWSConfig(),'AWS configuration');
    logger.info(`Server starting on port ${config.getPort()}.`);
});
