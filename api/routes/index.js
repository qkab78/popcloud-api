module.exports = (router) => {
    router.use('/api/auth', require('./auth-route'));
    router.use('/api/users', require('./users-route'));
    router.use('/api/csps', require('./csps-route'));
    router.use('/api/links', require('./links-route'));
}