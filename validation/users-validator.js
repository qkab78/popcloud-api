const Joi = require('joi');
const joi_objectID = require('joi-objectid')(Joi);
module.exports = {
    create: {
        firstname: Joi.string().regex(/^[a-zA-Z][a-z]*$/).required(),
        lastname: Joi.string().regex(/^[a-zA-Z][a-z]*$/).required(),
        email: Joi.string().email().required(),
        credit_card: Joi.object().required(),
        access: Joi.string().regex(/^[a-z]{3,10}/).required(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}/).required(),
        confirmPassword: Joi.string().regex(/^[a-zA-Z0-9]{8,30}/).required()
    },
    update: {
        email: Joi.string().email(),
        credit_card: Joi.object(),
        password: Joi.string().regex(/^[a-zA-Z0-9]{8,30}/)
    },
    delete: {
        id: joi_objectID()
    }
}