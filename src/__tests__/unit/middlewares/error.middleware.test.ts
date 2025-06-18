import { Request, Response } from 'express';
import { 
  errorHandler, 
  ValidationError, 
  UnauthorizedError, 
  ForbiddenError, 
  NotFoundError 
} from '../../../middlewares/error.middleware';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      path: '/test',
      method: 'GET',
      body: {},
      params: {},
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    nextFunction = jest.fn();
  });

  it('should handle ValidationError with 400 status', () => {
    const validationError = new ValidationError({ field: 'Field is required' });
    
    errorHandler(
      validationError, 
      mockRequest as Request, 
      mockResponse as Response, 
      nextFunction
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Validation Error',
      details: { field: 'Field is required' }
    });
  });

  it('should handle UnauthorizedError with 401 status', () => {
    const unauthorizedError = new UnauthorizedError('Invalid credentials');
    
    errorHandler(
      unauthorizedError, 
      mockRequest as Request, 
      mockResponse as Response, 
      nextFunction
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid credentials'
    });
  });

  it('should handle ForbiddenError with 403 status', () => {
    const forbiddenError = new ForbiddenError('Access denied');
    
    errorHandler(
      forbiddenError, 
      mockRequest as Request, 
      mockResponse as Response, 
      nextFunction
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Access denied'
    });
  });

  it('should handle NotFoundError with 404 status', () => {
    const notFoundError = new NotFoundError('Product');
    
    errorHandler(
      notFoundError, 
      mockRequest as Request, 
      mockResponse as Response, 
      nextFunction
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Not Found',
      message: 'Product not found'
    });
  });

  it('should handle generic errors with 500 status', () => {
    const genericError = new Error('Something went wrong');
    
    // Set NODE_ENV to development to show actual error message
    process.env.NODE_ENV = 'development';
    
    errorHandler(
      genericError, 
      mockRequest as Request, 
      mockResponse as Response, 
      nextFunction
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Something went wrong'
    });
  });

  it('should hide error details in production', () => {
    const genericError = new Error('Database connection failed');
    
    // Set NODE_ENV to production to hide actual error message
    process.env.NODE_ENV = 'production';
    
    errorHandler(
      genericError, 
      mockRequest as Request, 
      mockResponse as Response, 
      nextFunction
    );
    
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
    
    // Reset NODE_ENV
    process.env.NODE_ENV = 'development';
  });
});