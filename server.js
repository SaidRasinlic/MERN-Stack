require('dotenv').config();
const path = require('path');
const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const { logEvents, logger } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const corsOptions = require('./config/corsOptions');

const app = express();

connectDB();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/users', express.static(path.join(__dirname, '/public')));

app.use('/', require('./routes/root'));
app.use('/users', require('./routes/userRoutes'));
app.use('/notes', require('./routes/userNotes'));

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile('views/404.html', { root: './' });
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Foun/*  */d');
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3500;

mongoose.connection.once('open', () => {
  console.log('Successfull connected to the MongoDB.');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
});

mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});
