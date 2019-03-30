const jwt = require('jsonwebtoken');
const config = require("../config");

exports.isAuthenticate = async (ctx, next) => {
    let req = ctx.request;
    let token = req.body.token || req.query.token || req.headers["x-access-token"] || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);
    if (token) {
        let decoded = null;
        try {
            decoded = await jwt.verify(token, config.JWTSECRET)
        } catch (err) {
            console.log(err)
            return ctx.badRequest({ error: "BadToken" });
        }
        ctx.auth = decoded
        await next();

    } else {
        return ctx.send(401, { error: "NotTokenProvided" })
    }
}

exports.isAdmin = async (ctx, next) => {
    if (ctx.auth.access === "admin") {
        await next();
    } else {
        return ctx.send(401, { error: "PermissionDenied" })
    }

}

exports.isCsps = async (ctx, next) => {
    if (ctx.auth.access === "csp") {
        await next();
    } else {
        return ctx.send(401, { error: "PermissionDenied" })
    }

}
