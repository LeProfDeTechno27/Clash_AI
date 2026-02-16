const winston = require('winston');
const path = require('path');

const loggerInstance = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.resolve('logs/error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.resolve('logs/combined.log') })
  ]
});

module.exports = (req, res, next) => {
  loggerInstance.info({ id: req.id, method: req.method, url: req.url });
  next();
};

