import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Error de validación',
          errors: error.issues.map(err => ({
            campo: err.path.join('.'),
            mensaje: err.message
          }))
        });
      }
      return res.status(500).json({ message: 'Error interno de validación' });
    }
  };
};