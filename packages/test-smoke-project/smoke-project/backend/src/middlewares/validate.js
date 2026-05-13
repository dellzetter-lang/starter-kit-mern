const ApiError = require("../utils/ApiError");

const validate = (schema, property = "body") => (req, _res, next) => {
  const { value, error } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(", ");
    return next(new ApiError(400, message));
  }

  req[property] = value;
  return next();
};

module.exports = validate;
