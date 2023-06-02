const { logEvents } = require('./logger');

const errorHandler = (err, req, res, next) => {
  logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
  console.log(err.stack);
  res.status(res.status ? res.statusCode : 500).json({ message: err.message });
  next();
};

module.exports = errorHandler;
