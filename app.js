require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const centralizedErrorHandler = require('./middlewares/centralizedErrorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');

const rateLimit = require('./middlewares/rateLimit');

const { PORT = 3100, NODE_ENV, MONGO_URL } = process.env;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(helmet());
app.use(rateLimit);
app.use(cors);

mongoose.connect(NODE_ENV === 'production' ? MONGO_URL : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});
app.use(require('./routes'));

app.use(errorLogger);
app.use(errors());
app.use(centralizedErrorHandler);

app.listen(PORT);
