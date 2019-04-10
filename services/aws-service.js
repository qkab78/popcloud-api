const AWS = require('aws-sdk');
AWS.config.update({
    credentials: {
        accessKeyId: "", secretAccessKey: ""
    }, region: ''
});

const ec2 = new AWS.EC2({ apiVersion: "2016-11-15" });
const params = {
    DryRun: false
};

exports.showInstances = params => {
    ec2.describeInstances(params, (err, data) => {
        if (err) console.error(err.stack);
        return data.Reservations[0].Instances;
    });
}
exports.showInstance = params => {
    ec2.monitorInstances(params, (err, data) => {
        if (err) console.error(err.stack);
        return data.InstanceMonitorings;
    });
}
ec2.describeInstances(params, (err, data) => {
    if (err) console.error(err.stack);
    console.log(data)
    data.Reservations.map(res => {
        console.log(res)
        res.Instances.map(instance => {
            if (instance.KeyName === "client") {
                console.log(instance)
            }
        })
    })
    return data.Reservations[0].Instances;
});