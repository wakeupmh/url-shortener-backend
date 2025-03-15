import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodType } from 'zod';

export const validateRequest = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => {
          const path = err.path.join('.');
          return {
            status: '400',
            title: 'Validation Error',
            detail: err.message,
            source: {
              pointer: path.startsWith('body') 
                ? `/data/${path.replace('body.', '')}`
                : `/${path}`
            }
          };
        });
        
        console.warn(`validation error: ${JSON.stringify(formattedErrors)}`);
        
        res.status(400).json({
          errors: formattedErrors
        });
      } else {
        console.error(`unexpected validation error: ${error instanceof Error ? error.message : String(error)}`);
        
        res.status(500).json({
          errors: [{
            status: '500',
            title: 'Internal Server Error',
            detail: 'An unexpected error occurred during validation'
          }]
        });
      }
    }
  };
};
