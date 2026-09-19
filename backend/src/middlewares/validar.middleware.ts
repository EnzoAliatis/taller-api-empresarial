import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { fallo } from '../utils/respuesta.js';
import type { DetalleError } from '../utils/respuesta.js';

interface EsquemasAValidar {
  body?: ZodType;
  params?: ZodType;
}

/**
 * Validación perimetral: corre los esquemas Zod ANTES del controller.
 * Si algo no cumple, la petición se corta con 400 y nunca toca la base de datos.
 */
export const validar =
  (esquemas: EsquemasAValidar) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const detalles: DetalleError[] = [];

    if (esquemas.params) {
      const resultado = esquemas.params.safeParse(req.params);
      if (!resultado.success) {
        detalles.push(...aDetalles(resultado.error.issues));
      }
    }

    if (esquemas.body) {
      const resultado = esquemas.body.safeParse(req.body);
      if (resultado.success) {
        // Se reemplaza el body por el dato ya saneado (trim, campos desconocidos fuera).
        req.body = resultado.data;
      } else {
        detalles.push(...aDetalles(resultado.error.issues));
      }
    }

    if (detalles.length > 0) {
      res.status(400).json(fallo('Datos inválidos', detalles));
      return;
    }

    next();
  };

const aDetalles = (issues: { path: PropertyKey[]; message: string }[]): DetalleError[] =>
  issues.map((issue) => ({
    campo: issue.path.map(String).join('.') || '(raíz)',
    mensaje: issue.message,
  }));
