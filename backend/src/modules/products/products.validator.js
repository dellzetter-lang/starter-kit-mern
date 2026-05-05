const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().trim().required(),
});

const updateSchema = createSchema.fork(["name"], (s) => s.optional());

module.exports = { createSchema, updateSchema };
