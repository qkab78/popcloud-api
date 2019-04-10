const Csp = require("../models/csps-model");
const Link = require("../models/links-model");
const linksValidator = require("../../validation/links-validator");
const config = require("../../config");
const aws = require("../../services/aws-service")
const ec2 = require("../../services/aws-service").awsInit(
  config.AWS_KEY,
  config.AWS_SECRET,
  config.AWS_REGION,
  config.AWS_API_VERSION
);
exports.get = async ctx => {
  if (ctx.auth.access !== "csp")
    return ctx.send(401, { error: "PermissionDenied" });
  let csp = await Csp.findOne({ user: ctx.auth.id });
  if (!csp) return ctx.notFound({ error: "NotFound" });
  let links = await Link.find({ csp: csp._id.toString() });
  return ctx.ok(links);
};

exports.getLink = async ctx => {
  if (ctx.auth.access !== "csp")
    return ctx.send(401, { error: "PermissionDenied" });
  const { id } = ctx.params;
  if (ctx.auth.id) {
    let link = await Link.findById(id);
    if (link) return ctx.ok(link);
    else return ctx.notFound({ error: "NotFound" });
  } else {
    return ctx.send(401, { error: "PermissionDenied" });
  }
};

exports.create = async ctx => {
  if (ctx.auth.access !== "csp")
    return ctx.send(401, { error: "PermissionDenied" });
  const reqData = ctx.request.body;
  let csp = await Csp.findOne({ user: ctx.auth.id });
  if (!csp) return ctx.notFound({ error: "NotFound" });
  reqData.csp = csp._id.toString();
  let link = new Link({
    csp: csp._id,
    name: reqData.name,
  });
  let validation = link.joiValidate(reqData, linksValidator.create);
  if (validation.error) return ctx.badRequest({ error: validation.error });
  const keyPair = await aws.createKey( ec2, { KeyName: csp.name });
    console.log('data returned', keyPair)
    if(keyPair){
    // console.log(keyPair)
    const instanceParams = {
      ImageId:config.AWS_AMI,
      InstanceType:'t2.micro',
      KeyName:keyPair.KeyName,
      MinCount:1,
      MaxCount:1
    }
    // aws.createInstance(ec2, instanceParams, `tag_name_${csp.name}`, `tag_value_${reqData.tag_value}`);
  }
  // console.log('links', csp);
  // if (await link.save()) {
  //     csp.links.push(link._id);
  //     await csp.save();
  //     return ctx.ok(link);
  // } else {
  //     ctx.badRequest({ error: "ErrorInCreatingLink" })
  // }
};

exports.delete = async ctx => {
  if (ctx.auth.access !== "csp")
    return ctx.send(401, { error: "PermissionDenied" });
  const { id } = ctx.params;
  const link = await Link.findOne({ _id: id });
  if (!link) return ctx.badRequest({ error: "linkNotFound" });
  let validation = link.joiValidate({ id }, linksValidator.delete);
  if (validation.error) return ctx.badRequest({ error: validation.error });
  if (ctx.auth.access === "csp") {
    let csp = await Csp.findById(link.csp);
    if (csp.links.indexOf(link._id) !== -1) {
      csp.links.splice(csp.links.indexOf(link._id), 1);
      await csp.save();
    }
    await link.remove();
    return ctx.ok({ message: "LinkDeleted" });
  } else {
    return ctx.badRequest({ error: "PermissionDenied" });
  }
};

exports.update = async ctx => {
  if (ctx.auth.access !== "csp")
    return ctx.send(401, { error: "PermissionDenied" });
  const { id } = ctx.params;
  const reqData = ctx.request.body;
  if (ctx.auth.access === "csp") {
    let link = await Link.findById(id);
    if (link) {
      link = Object.assign(link, reqData);
      let validation = link.joiValidate(reqData, linksValidator.update);
      if (validation.error) return ctx.badRequest({ error: validation.error });
      await link.save();
      return ctx.ok(link);
    } else {
      return ctx.notFound({ error: "NotFound" });
    }
  } else {
    return ctx.send(401, { error: "PermissionDenied" });
  }
};