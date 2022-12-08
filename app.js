require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const centralizedErrorHandler = require('./middlewares/centralizedErrorHandler');
const { validationOfAuth, validationOfLogin } = require('./middlewares/reqValidation');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const NotFound = require('./errors/NotFound');
const {
  createUser, login, deleteToken,
} = require('./controllers/users');
const auth = require('./middlewares/auth');

const { PORT = 3100 } = process.env;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(cors);
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
mongoose.connect('mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.post('/signin', validationOfLogin, login);
app.post('/signout', deleteToken);
app.post('/signup', validationOfAuth, createUser);
app.use('/users', require('./routes/users'));
app.use('/movies', require('./routes/movies'));

app.use(auth);
app.use((req, res, next) => next(new NotFound('Некорректный адрес запроса')));
app.use(errorLogger);
app.use(errors());
app.use(centralizedErrorHandler);

app.listen(PORT);
