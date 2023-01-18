const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const Users = require('../models/user');
const { CAST_ERROR } = require('../constants');

const { NODE_ENV, JWT_SECRET } = process.env;

const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const NotFound = require('../errors/NotFound');

module.exports.getUser = (req, res, next) => {
  Users.findById(req.params.userId || req.user._id)
    .orFail(() => new NotFound('Запрашиваемый пользователь не найден'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === CAST_ERROR) {
        return next(new BadRequest('Некорректные данные заапроса'));
      }
      return next(err);
    });
};
module.exports.createUser = (req, res, next) => {
  const {
    name, email,
  } = req.body;
  bcrypt.hash(req.body.password, 10)
    .then((hash) => Users.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => res.send({
      data: {
        email: user.email,
        name: user.name,
      },
    }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Некорректные данные запроса'));
      }

      if (err.code === 11000) {
        return next(new Conflict('Пользователь с такими данными уже существует'));
      }

      return next(err);
    });
};
module.exports.editUser = (req, res, next) => {
  Users.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  })
    .orFail(() => new NotFound('Запрашиваемый пользователь не найден'))
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Некорректные данные запроса'));
      }

      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return Users.findUserByCredentials(email, password)
    .then((user) => {
      const token = jsonwebtoken.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
        .status(200).send({ message: 'Авторзация прошла успешно' });
    })
    .catch(next);
};
module.exports.deleteToken = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    .send({ message: 'Вы вышли из профиля' });
};
