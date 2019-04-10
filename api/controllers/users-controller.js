const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const config = require('../../config');
const User = require('../models/users-model');
const Csp = require('../models/csps-model');
const Link = require('../models/links-model');
const userValidator = require('../../validation/users-validator');

exports.get = async (ctx) => {
    let users = await User.find({})
    return ctx.ok(users.filter(user => user._id != ctx.auth.id));
}

exports.getUser = async (ctx) => {
    const { id } = ctx.params;
    if (ctx.auth.id === id || ctx.auth.access === 'admin') {
        let user = await User.findById(id);
        if (user)
            return ctx.ok(user)
        else
            return ctx.notFound({ error: "NotFound" })
    } else {
        return ctx.send(401, { error: "PermissionDenied" })
    }
}

exports.create = async (ctx) => {
    const reqData = ctx.request.body;
    let user = new User(reqData)
    let validation = user.joiValidate(reqData, userValidator.create);
    if (validation.error) return ctx.badRequest({ error: validation.error })
    const userExist = await User.findOne({ email: reqData.email });
    if (userExist) {
        ctx.badRequest('UserAlreadyExists')
    } else {
        if (reqData.password === reqData.confirmPassword) {
            await user.save()
            const payload = {
                id: user._id,
                email: user.email,
                access: user.access,
                credit_card: user.credit_card,
            };
            const token = await jwt.sign(payload, config.JWTSECRET);
            return ctx.ok({ token, user })
        } else {
            return ctx.badRequest({ error: "FieldIncorrectOrMissing" })
        }
    }
}

exports.delete = async (ctx) => {
    const { id } = ctx.params;
    const user = await User.findOne({ _id: id });
    if (!user) return ctx.badRequest({ error: "UserNotFound" })
    let validation = user.joiValidate({ id }, userValidator.delete);
    if (validation.error) return ctx.badRequest({ error: validation.error });
    let csp = await Csp.findOne({ user: id });
    if (!csp) return ctx.badRequest({ error: "CspNotFound" })
    let links = await Link.find({ csp: csp._id });
    if (!links) return ctx.badRequest({ error: "LinksNotFound" })
    links.map(async link => await link.remove());
    await csp.remove();
    await user.remove();
    return ctx.ok({ message: "UserDeleted" })
}

exports.update = async (ctx) => {
    const id = ctx.params.id;
    const reqData = ctx.request.body;
    if (ctx.auth.id === id) {
        if (reqData.email && await User.findOne({ email: reqData.email, _id: { $ne: id } })) {
            return ctx.badRequest({ error: "EmailAlreadyExists" })
        } else {
            let user = await User.findById(id)
            if (user) {
                user = Object.assign(user, reqData);
                let validation = user.joiValidate(reqData, userValidator.update);
                if (validation.error) return ctx.badRequest({ error: validation.error })
                if (validation.error) {
                    return ctx.badRequest({ error: "FieldIncorrectOrMissing" })
                } else {
                    await user.save()
                    return ctx.ok(user)
                }
            } else {
                return ctx.notFound({ error: "NotFound" })
            }
        }
    } else {
        return ctx.send(401, { error: "PermissionDenied" })
    }

}

