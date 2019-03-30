const Joi = require('joi');
const joi_objectID = require('joi-objectid')(Joi);
module.exports = {
    create: {
        name: Joi.string().regex(/^[a-zA-Z]/).required(),
        description: Joi.string().regex(/^[a-zA-Z][a-z]/).required(),
        user: joi_objectID()
    },
    update: {
        description: Joi.string().regex(/^[a-zA-Z][a-z]/),
        links: Joi.array(),
    },
    delete: {
        id: joi_objectID()
    }
}