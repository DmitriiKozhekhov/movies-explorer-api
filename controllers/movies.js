const { default: mongoose } = require('mongoose');
const Movies = require('../models/movie');
const { CAST_ERROR } = require('../constants');
const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Forbidden = require('../errors/Forbidden');

module.exports.getMovie = (req, res, next) => {
  Movies.find({}).sort({ createdAt: -1 })
    .then((movie) => res.send(movie))
    .catch((err) => next(err));
};
module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movies.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner: req.user._id,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Некорректные данные запроса'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movies.findOne({ movieId: req.params.movieId, owner: req.user._id }).orFail(() => new NotFound('Фильм не найден'))
    .then((movie) => {
      if (movie.owner.toString() !== req.user._id) {
        throw new Forbidden('Вы не можете удалить не свой фильм');
      }
      return Movies.findOneAndRemove({ movieId: req.params.movieId })
        .then(() => {
          res.send({ data: movie });
        });
    })
    .catch((err) => {
      if (err.name === CAST_ERROR) {
        return next(new BadRequest('Некорректные данные запроса'));
      }

      return next(err);
    });
};
