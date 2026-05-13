const Joi = require("joi");

/**
 * Tempmod Validation Schemas
 * ================================
 * Keep these in sync with tempmod.model.js schema
 */

const createTempmodSchema = Joi.object({
  name: Joi.string().trim().required()
});

const updateTempmodSchema = createTempmodSchema.fork(
  [],
  (schema) => schema.optional()
);

module.exports = {
  createTempmodSchema,
  updateTempmodSchema,
};
