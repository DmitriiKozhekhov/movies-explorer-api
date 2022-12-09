const router = require('express').Router();
const { validationOfAuth, validationOfLogin } = require('../middlewares/reqValidation');
const NotFound = require('../errors/NotFound');
const {
  createUser, login, deleteToken,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

router.post('/signin', validationOfLogin, login);
router.post('/signup', validationOfAuth, createUser);
router.use(auth);

router.post('/signout', deleteToken);
router.use('/users', require('./users'));
router.use('/movies', require('./movies'));

router.use((req, res, next) => next(new NotFound('Некорректный адрес запроса')));
module.exports = router;
