/*
This file is used to create schema of User for bdd
*/

const config = require('../../config');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Joi = require('joi');
const Schema = mongoose.Schema; //Create mongoose Schema

let schema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    client_name: { type: String },
    credit_card: { type: Object },
    access: { type: String, required: true, enum: ['user', 'csp', 'admin'], default: 'user' },
    createdOn: { type: Date, default: Date.now },
})

/**
 This function is called before storing user in database
 **/


schema.pre('save', async function () {
    // if password is not modified or created
    if (this.isModified('password')) {
        let salt = await bcrypt.genSalt(parseInt(config.SALT));
        let hash = await bcrypt.hash(this.password, salt);
        this.password = hash
    }
});

/** 
 Comparing user password and specified password
 * @param {String} candidatePassword Password to compare
 * @return {bool}                    Return true if match else return false
 **/
schema.methods.comparePasswords = function (candidatePassword, cb) {
    return bcrypt.compareSync(candidatePassword, this.password);
};
schema.methods.joiValidate = function (request, schemaType) {
    const joiSchema = Joi.object().keys(schemaType);
    return Joi.validate(request, joiSchema);
}
module.exports = mongoose.model('User', schema, 'user');


