/*
This file is used to create schema of Enterprise for bdd
*/

const mongoose = require('mongoose')
const Joi = require('joi');
const Schema = mongoose.Schema; //Create mongoose Schema

let schema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    links: [Schema.Types.ObjectId],
    createdOn: { type: Date, default: Date.now },
})
schema.methods.joiValidate = function (request, schemaType) {
    const joiSchema = Joi.object().keys(schemaType);
    return Joi.validate(request, joiSchema);
}
module.exports = mongoose.model('Csp', schema, 'csps');


