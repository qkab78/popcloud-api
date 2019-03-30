const Router = require('koa-router');
const Links = require('../controllers/links-controller');
const { isAuthenticate, isCsps, isAdmin } = require('../../middlewares')

const router = new Router();

router.get('/', isAuthenticate, isCsps, Links.get);
router.post('/', isAuthenticate, isCsps, Links.create);
router.get('/:id', isAuthenticate, isCsps, Links.getLink);
router.put('/:id', isAuthenticate, isCsps, Links.update);
router.delete('/:id', isAuthenticate, isCsps, Links.delete);

module.exports = router.routes();