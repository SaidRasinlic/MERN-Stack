const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const logEvents = async (message, fileName) => {
  const logItem = `${format(new Date(), 'dd-MM-yyyy\tHH:mm:ss')}\t${uuid()}\t${message}\n`;
  console.log(logItem);

  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) await fsPromises.mkdir(__dirname, '..', 'logs');
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', fileName), logItem);
  } catch (error) {
    console.log(error);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.headers.url}\t${req.headers.origin}`, 'reqLog.txt');
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logEvents, logger };
