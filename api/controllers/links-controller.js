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
  // const keyPair = await aws.createKey( ec2, { KeyName: csp.name });
  ec2.createKeyPair({ KeyName: ctx.auth.email }, (err, data)=>{
    if(err) console.error(err)
    else {
    const instanceParams = {
      ImageId:config.AWS_AMI,
      InstanceType:'t2.micro',
      KeyName:data.KeyName,
      MinCount:1,
      MaxCount:1
    }
    // aws.createInstance(ec2, instanceParams, `tag_name_${ctx.auth.email}`, `tag_value_${reqData.tag_value}`);
    const instancePromise = ec2.runInstances(instanceParams).promise();
    instancePromise
        .then(data => {
            // console.log('instance', data);
            const instanceId = data.Instances[0].InstanceId;
            const keyName = data.Instances[0].KeyName;
            const vpcId = data.Instances[0].VpcId;
            // console.log("Created instance", instanceId);
            const tagParams = {
                Resources: [instanceId],
                Tags: [
                    {
                        Key: `tag_name_${ctx.auth.email}`,
                        Value: `tag_value_${reqData.tag_value}`
                    }
                ]
            };
            const tagPromise = ec2.createTags(tagParams).promise();
            tagPromise
                .then(data => {
                    console.log("Instance tagged");
                    let link = new Link({
                      csp: csp._id,
                      link_id: instanceId,
                      link_keyName: keyName,
                      link_vpcId: vpcId,
                      name: reqData.name,
                    });
                    let validation = link.joiValidate(reqData, linksValidator.create);
                    if (validation.error) return ctx.badRequest({ error: validation.error });
                    console.log('link',link)
                    link.save((err, data)=>{
                      if(err) ctx.badRequest({ error: "ErrorInCreatingLink" })
                      else{
                        csp.links.push(link._id);
                        csp.save((err, data)=>{
                          if(err){
                            ctx.badRequest({ error: "ErrorInCreatingLink" })
                          }else{
                            return ctx.ok(link);
                          }
                        });
                      }
                    });
                })
                .catch(err => console.error(err, err.stack));
        })
        .catch(err => console.error(err, err.stack));
    }
})
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
