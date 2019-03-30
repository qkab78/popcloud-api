const Csp = require('../models/csps-model');
const Link = require('../models/links-model');
const cspsValidator = require('../../validation/csps-validator');

exports.get = async (ctx) => {
    let csps = await Csp.find();
    return ctx.ok(csps)
}

exports.getCsp = async (ctx) => {
    const { id } = ctx.params;
    if (ctx.auth.id) {
        let csp = await Csp.findById(id);
        if (csp)
            return ctx.ok(csp)
        else
            return ctx.notFound({ error: "NotFound" })
    } else {
        return ctx.send(401, { error: "PermissionDenied" })
    }
}

exports.create = async (ctx) => {
    if (ctx.auth.access !== 'csp') return ctx.send(401, { error: "PermissionDenied" });
    const reqData = ctx.request.body;
    reqData.user = ctx.auth.id;
    let csp = new Csp(reqData);
    let validation = csp.joiValidate(reqData, cspsValidator.create);
    if (validation.error) return ctx.badRequest({ error: validation.error });
    await csp.save();
    return ctx.ok(csp);
}

exports.delete = async (ctx) => {
    if (ctx.auth.access !== 'csp' || ctx.auth.access !== 'admin') return ctx.send(401, { error: "PermissionDenied" });
    const { id } = ctx.params;
    const csp = await Csp.findOne({ _id: id });
    if (!csp) return ctx.badRequest({ error: "cspNotFound" })
    let validation = csp.joiValidate({ id }, cspsValidator.delete);
    if (validation.error) return ctx.badRequest({ error: validation.error })
    if (ctx.auth.access === 'csp' && ctx.auth.id === csp.user) {

        // await enterprise.remove();
        return ctx.ok({ message: "EnterpriseDeleted" })
    } else {
        return ctx.badRequest({ error: "PermissionDenied" })
    }
}

exports.update = async (ctx) => {
    if (ctx.auth.access !== 'csp') return ctx.send(401, { error: "PermissionDenied" });
    const { id } = ctx.params;
    const reqData = ctx.request.body;
    if (ctx.auth.access === 'csp') {
        let csp = await Csp.findById(id)
        if (csp) {
            csp = Object.assign(csp, reqData);
            let validation = csp.joiValidate(reqData, cspsValidator.update);
            if (validation.error) return ctx.badRequest({ error: validation.error })
            await csp.save()
            return ctx.ok(csp)
        } else {
            return ctx.notFound({ error: "NotFound" })
        }
    } else {
        return ctx.send(401, { error: "PermissionDenied" })
    }
}

