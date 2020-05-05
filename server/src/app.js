const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');


require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json()); // parse incomming json data

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
