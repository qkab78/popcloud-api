const Router = require('koa-router');
const Auth = require('../controllers/auth-controller');

const router = new Router();

router.post('/', Auth.login);

module.exports = router.routes();