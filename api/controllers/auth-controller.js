const jwt = require('jsonwebtoken')
const config = require('../../config');
const User = require('../models/users-model');
const { isString } = require('../../utils/functions');


exports.login = async (ctx) => {
    const reqData = ctx.request.body
    if (!isString(reqData.email) || !isString(reqData.password)) {
        return ctx.badRequest({ error: "FieldsIncorrectOrMissing" })
    } else {
        const user = await User.findOne({ email: reqData.email }).select("+password")
        if (!user) {
            return ctx.badRequest({ error: "BadEmail" });
        } else {
            const isSamePasswords = user.comparePasswords(reqData.password)
            if (isSamePasswords) {
                let payload;
                if (user.access === "admin") {
                    payload = {
                        id: user._id,
                        email: user.email,
                        access: user.access,
                    };
                } else {
                    payload = {
                        id: user._id,
                        email: user.email,
                        access: user.access,
                        credit_card: user.credit_card,
                    };
                }
                // create a token string
                const token = await jwt.sign(payload, config.JWTSECRET);
                ctx.ok({ token });
            } else {
                return ctx.badRequest({ error: "BadPassword" });
            }
        }

    }
};