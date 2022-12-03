const {schemas: validationSchemas} = require('../utilities/validation');

module.exports = async (req, res, next, schema) => {
  /**
     * @name validation
     * @description Middleware that tests the validity of a body given a specified schema
     */
  try {
    const {body} = req;
    await validationSchemas[schema].validate(body);
    next();
  } catch (err) {
    next({
      message: `Validation Error: ${err.errors[0]}`,
      status: 400
    });
  }
};
