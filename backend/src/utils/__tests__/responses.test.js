const ApiResponse = require('../ApiResponse');
const ApiError = require('../ApiError');

describe('ApiResponse', () => {
  it('should create a success response object', () => {
    const response = new ApiResponse(200, 'Success', { id: 1 });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Success');
    expect(response.body.data).toEqual({ id: 1 });
  });
});

describe('ApiError', () => {
  it('should create an error object with status code', () => {
    const error = new ApiError(400, 'Bad Request');
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad Request');
    expect(error.isOperational).toBe(true);
  });

  it('should capture stack trace', () => {
    const error = new ApiError(500, 'Internal Server Error');
    expect(error.stack).toBeDefined();
  });
});
