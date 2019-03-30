const Joi = require('joi');
const joi_objectID = require('joi-objectid')(Joi);
module.exports = {
    create: {
        csp: joi_objectID().required(),
        name: Joi.string().regex(/^[a-zA-Z0-9].{8,30}/).required(),
        state: Joi.boolean().required(),
    },
    update: {
        state: Joi.boolean().required()
    },
    delete: {
        id: joi_objectID()
    }
}