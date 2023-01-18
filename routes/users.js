const router = require('express').Router();
const auth = require('../middlewares/auth');
const { validationOfUser } = require('../middlewares/reqValidation');

const {
  getUser,
  editUser,
} = require('../controllers/users');

router.use(auth);
router.get('/me', getUser);
router.patch('/me', validationOfUser, editUser);
module.exports = router;
