const Joi = require("joi");

/**
 * Users Validation Schemas
 * ================================
 * Keep these in sync with users.model.js schema
 */

const createUsersSchema = Joi.object({
  name: Joi.string().trim().required()
});

const updateUsersSchema = createUsersSchema.fork(
  [],
  (schema) => schema.optional()
);

module.exports = {
  createUsersSchema,
  updateUsersSchema,
};
