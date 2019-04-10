const AWS = require('aws-sdk');
AWS.config.update({
    credentials: {
        accessKeyId: "AKIAQR6SFIJEBYJOVMPZ", secretAccessKey: "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"
    }, region: 'eu-west-3'
});

const ec2 = new AWS.EC2({ apiVersion: "2016-11-15" });
const params = {
    // InstanceIds: ['i-0f4ead3ff47a40bda'],
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
    // console.log(data.Reservations[0].Instances[0].KeyName)
    console.log(data)
    data.Reservations.map(res => {
        console.log(res)
        res.Instances.map(instance => {
            if (instance.KeyName === "client") {
                console.log(instance)
            }
        })
    })
    // return data.Reservations[0].Instances;
});