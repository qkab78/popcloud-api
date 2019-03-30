/*
This file is used to create schema of Enterprise for bdd
*/

const mongoose = require('mongoose')
const Joi = require('joi');
const Schema = mongoose.Schema; //Create mongoose Schema

let schema = new Schema({
    csp: { type: mongoose.Types.ObjectId, ref: "csps" },
    name: { type: String, required: true },
    state: { type: Boolean, required: true, default: false },
    createdOn: { type: Date, default: Date.now },
})
schema.methods.joiValidate = function (request, schemaType) {
    const joiSchema = Joi.object().keys(schemaType);
    return Joi.validate(request, joiSchema);
}
module.exports = mongoose.model('Link', schema, 'links');


