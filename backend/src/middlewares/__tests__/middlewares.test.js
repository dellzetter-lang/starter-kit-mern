const Joi = require('joi');
const validate = require('../validate');
const notFoundMiddleware = require('../notFound.middleware');
const ApiError = require('../../utils/ApiError');

describe('validate middleware', () => {
  const schema = Joi.object({
    name: Joi.string().required(),
  });

  it('should call next() if validation passes', () => {
    const req = { body: { name: 'Test' } };
    const next = vi.fn();
    validate(schema)(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'Test' });
  });

  it('should call next(ApiError) if validation fails', () => {
    const req = { body: {} };
    const next = vi.fn();
    validate(schema)(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});

describe('notFoundMiddleware', () => {
  it('should call next(ApiError) with 404', () => {
    const req = { originalUrl: '/unknown' };
    const next = vi.fn();
    notFoundMiddleware(req, {}, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });
});
