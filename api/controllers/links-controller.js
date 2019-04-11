const util = require('util')
const Csp = require("../models/csps-model");
const Link = require("../models/links-model");
const linksValidator = require("../../validation/links-validator");
const config = require("../../config");
const aws = require("../../services/aws-service")
const { createKey, createInstance, createTags, showInstance, showInstances } = require("../../services/aws-service")

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
    if (!link) return ctx.notFound({ error: "NotFound" });
    // console.log(link)
    const instance = await showInstances({ InstanceIds: [link.link_id], DryRun: false })
    console.log(instance.Reservations[0].Instances[0])
    // console.log(instance.InstanceMonitorings[0].Monitoring.State)
    if (instance.Reservations[0].Instances[0].Tags.length > 0) {
      instance.Reservations[0].Instances[0].Tags.map(tag => {
        link.link_tags.push({ key: tag.Key, value: tag.Value })
      });
      await link.save()
    }
    if (instance.Reservations[0].Instances[0].SecurityGroups.length > 0) {
      instance.Reservations[0].Instances[0].SecurityGroups.map(group => {
        link.link_securityGroups.push({ id: group.GroupId, name: group.GroupName })
      });
      await link.save()
    }
    if (instance.Reservations[0].Instances[0].PublicDnsName !== '') {
      link.link_publicDnsName = instance.Reservations[0].Instances[0].PublicDnsName
      await link.save()
    }
    if (instance.Reservations[0].Instances[0].Monitoring.State === 'enabled') {
      link.state = true;
      await link.save();
    }
    return ctx.ok(link);
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
  const keyPair = await createKey({ KeyName: ctx.auth.email });
  console.log('Keypair:', keyPair)
  const keyName = keyPair.KeyName;
  const instanceParams = {
    ImageId: config.AWS_AMI,
    InstanceType: 't2.micro',
    KeyName: keyName,
    MinCount: 1,
    MaxCount: 1
  }
  const instance = await createInstance(instanceParams);
  // console.log('instance', instance);
  const instanceId = instance.Instances[0].InstanceId;
  const vpcId = instance.Instances[0].VpcId;
  const tagParams = {
    Resources: [instanceId],
    Tags: [
      {
        Key: `tag_name_${ctx.auth.email}`,
        Value: `tag_value_${reqData.tag_value}`
      }
    ]
  };
  const tag = createTags(tagParams);
  const linkData = {
    csp: reqData.csp,
    link_id: instanceId,
    link_keyName: keyName,
    link_vpcId: vpcId,
    name: instanceId,
    state: reqData.state
  };
  let link = new Link(linkData);
  let validation = link.joiValidate(linkData, linksValidator.create);
  if (validation.error) return ctx.badRequest({ error: validation.error });
  if (await link.save()) {
    csp.links.push(link._id);
    await csp.save();
    return ctx.ok(link);
  } else {
    ctx.badRequest({ error: "ErrorInCreatingLink" })
  }
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
