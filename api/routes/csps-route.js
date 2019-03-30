const Router = require('koa-router');
const Csps = require('../controllers/csps-controller');
const { isAuthenticate, isCsps, isAdmin } = require('../../middlewares')

const router = new Router();

router.post('/', isAuthenticate, Csps.create);

module.exports = router.routes();