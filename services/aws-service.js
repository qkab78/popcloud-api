const AWS = require("aws-sdk");
const util = require('util')
const config = require("../config");
/* Initialisation du sdk AWS */
// exports.awsInit = (key, secret, region, version) => {
//     AWS.config.update({
//         credentials: {
//             accessKeyId: key,
//             secretAccessKey: secret
//         },
//         region
//     });

//     return new AWS.EC2({ apiVersion: version });
// };
AWS.config.update({
    credentials: {
        accessKeyId: config.AWS_KEY,
        secretAccessKey: config.AWS_SECRET
    },
    region: config.AWS_REGION
});
const ec2 = new AWS.EC2({ apiVersion: config.AWS_API_VERSION });
exports.createKey = util.promisify(ec2.createKeyPair.bind(ec2));
exports.createInstance = util.promisify(ec2.runInstances.bind(ec2));
exports.createTags = util.promisify(ec2.createTags.bind(ec2));
exports.createGroup = util.promisify(ec2.createSecurityGroup.bind(ec2));
exports.showInstances = util.promisify(ec2.describeInstances.bind(ec2));
exports.showInstance = util.promisify(ec2.monitorInstances.bind(ec2));
exports.showKeyPairs = util.promisify(ec2.describeKeyPairs.bind(ec2));
exports.showVpcs = util.promisify(ec2.describeVpcs.bind(ec2));
exports.authorizeGroupIngress = util.promisify(ec2.authorizeSecurityGroupIngress.bind(ec2));
exports.deleteKeyPairs = util.promisify(ec2.deleteKeyPair.bind(ec2));

/* Gestion des instances */
// exports.createInstance = async (ec2, instanceParams, tagName, tagValue) => {
//     const instancePromise = await ec2.runInstances(instanceParams).promise();
//     console.log(instancePromise)
//     // instancePromise
//     //     .then(data => {
//     //         console.log('instance', data);
//     //         const instanceId = data.Instances[0].InstanceId;
//     //         console.log("Created instance", instanceId);
//     //         const tagParams = {
//     //             Resources: [instanceId],
//     //             Tags: [
//     //                 {
//     //                     Key: tagName,
//     //                     Value: tagValue
//     //                 }
//     //             ]
//     //         };
//     //         const tagPromise = ec2.createTags(tagParams).promise();
//     //         tagPromise
//     //             .then(data => {
//     //                 console.log("Instance tagged", data);
//     //             })
//     //             .catch(err => console.error(err, err.stack));
//     //     })
//     //     .catch(err => console.error(err, err.stack));
// };

// exports.showInstances = (ec2, params) => {
//     ec2.describeInstances(params, (err, data) => {
//         if (err) console.error(err.stack);
//         return data.Reservations[0].Instances;
//     });
// };
// exports.showInstance = (ec2, params) => {
//     ec2.monitorInstances(params, (err, data) => {
//         if (err) console.error(err.stack);
//         return data.InstanceMonitorings;
//     });
// };

/* Gestion des clés */
// exports.createKey = async (ec2, params) => {
//     ec2.createKeyPair(params, (err, data) => {
//         if (err) console.error(err)
//         else console.log(data)
//     });
// };

// exports.describeKey = ec2 => {
//     ec2.describeKeyPair((err, data) => {
//         if (err) console.error(err);
//         else {
//             console.log(data);
//             return data;
//         }
//     });
// };

// exports.deleteKey = (ec2, params) => {
//     ec2.deleteKeyPair(params, (err, data) => {
//         if (err) console.error(err);
//         else {
//             console.log("Key Pair deleted");
//         }
//     });
// };

/* Gestion des groupes */
exports.createGroup = (
    ec2,
    securityGroupName,
    securityGroupDesciption,
    permissions
) => {
    ec2.describeVpcs((err, data) => {
        if (err) console.error("Cannot retrieve a VPC", err);
        else {
            const paramsSecurityGroup = {
                Description: securityGroupDesciption,
                GroupName: securityGroupName,
                VpcId: data.Vpcs[0].VpcId
            };
            ec2.createSecurityGroup(paramsSecurityGroup, (err, data) => {
                if (err) console.error(err);
                else {
                    const securityGroupId = data.GroupId;
                    console.log("Success", securityGroupId);
                    const paramIngress = {
                        GroupName: securityGroupName,
                        IpPermissions: permissions
                    };
                    ec2.authorizeSecurityGroupIngress(paramIngress, (err, data) => {
                        if (err) console.error(err);
                        else {
                            console.log("Ingress Successfully Set", data);
                        }
                    });
                }
            });
        }
    });
};

exports.deleteGroup = (ec2, params) => {
    ec2.describeSecurityGroups(params, (err, data) => {
        if (err) console.error(err);
        else {
            console.log("Success", data.SecurityGroups);
        }
    });
};

/* Gestion des adressages IP */
exports.describeIP = (ec2, params) => {
    ec2.describeAddresses(params, (err, data) => {
        if (err) console.error(err);
        else {
            console.log("Success", JSON.stringify(data.Addresses));
            return data;
        }
    });
};

exports.createIP = (ec2, params, instanceId) => {
    ec2.allocateAddress(params, (err, data) => {
        if (err) console.error(err);
        else {
            console.log("Success", JSON.stringify(data.AllocationId));
            const paramsAssociateAddress = {
                AllocationId: data.AllocationId,
                InstanceId: instanceId
            };
            ec2.associateAddress(paramsAssociateAddress, (err, data) => {
                if (err) {
                    console.error("Address Not Associated", err);
                } else {
                    console.log("Address associated:", data.AssociationId);
                }
            });
        }
    });
};

exports.deleteIP = (ec2, params) => {
    ec2.releaseAddress(params, (err, data) => {
        if (err) console.error(err);
        else console.log("Successfully deleted");
    });
};
