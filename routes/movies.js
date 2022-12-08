const router = require('express').Router();
const auth = require('../middlewares/auth');
const { validationOfMovie, validationOfMovieId } = require('../middlewares/reqValidation');

const {
  getMovie,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.use(auth);
router.get('/', getMovie);
router.post('/', validationOfMovie, createMovie);
router.delete('/:movieId', validationOfMovieId, deleteMovie);
module.exports = router;
