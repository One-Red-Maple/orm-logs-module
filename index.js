const processId = Math.floor(Math.random() * (99999 - 10000) ) + 10000;

module.exports = {

  LEVELS : {
    "VERBOSE": 0,
    "INFO": 1,
    "WARN": 2,
    "ERROR": 3,
    "CRITICAL": 4,
    "OUTAGE": 5
  },

  init(processName, hostLocation) {

    this.logger = require('logzio-nodejs').createLogger({
      token: process.env.LOGZ_IO_KEY,
      protocol: 'https',
      host: 'listener.logz.io',
      port: '8071',
      extraFields: {
        "orm-process-name": processName,
        "orm-process-id": processId,
        "orm-host-location": hostLocation
      }
    });
  },

  getLevelNameByValue : function(value) {
    return  Object.keys(this.LEVELS)[value];
  },

  log: function(msg, options) {

    if(!options) options = {};
    if(!options.level) options.level = this.LEVELS.VERBOSE;
    if(!options.tags) options.tags = [];

    if(options.level >= (process.env.LOG_LEVEL || this.LEVELS.INFO)){

      if(options.level == this.LEVELS.WARN || options.level == this.LEVELS.ERROR || options.level == this.LEVELS.CRITICAL || options.level == this.LEVELS.OUTAGE)
        console.error(`${this.getLevelNameByValue(options.level)} : ${msg} : ${options.tags}`); // Log to standard error
      else
        console.log(`${this.getLevelNameByValue(options.level)} : ${msg} : ${options.tags}`); // Log to standard out
    }

     // Log to logz.io
    if(this.logger) {

	  if(options.level < process.env.LOG_LEVEL){
		break;
	  } else {
		  // Log to logz.io
		  this.logger.log({
			"message": msg,
			"orm-log-level": options.level,
			"tags": options.tags
		  });
		} else {
		  console.log(msg);
		}
    }
  }
};
