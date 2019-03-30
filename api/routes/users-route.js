const Router = require('koa-router');
const Users = require('../controllers/users-controller');
const { isAuthenticate, isCsps, isAdmin } = require('../../middlewares')
const router = new Router();

// router.post('/', Users.login);
router.get('/', isAuthenticate, isAdmin, Users.get)
router.post('/', Users.create)

module.exports = router.routes();