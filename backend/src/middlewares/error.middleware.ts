import type { NextFunction, Request, Response } from 'express';
import { fallo } from '../utils/respuesta.js';

/**
 * Ruta inexistente: se responde con el wrapper en vez del HTML por defecto de Express.
 */
export const rutaNoEncontrada = (req: Request, res: Response): void => {
  res.status(404).json(fallo(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

/**
 * Interceptor global de errores.
 *
 * Es la última barrera: cualquier excepción que escape de los controllers
 * termina acá y sale con el formato unificado. Nunca se filtra un stack trace
 * al cliente; el detalle técnico queda en el log del servidor.
 *
 * Express identifica este middleware por tener cuatro parámetros.
 */
export const manejadorErrores = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('❌ [Error]:', error);

  if (res.headersSent) {
    return;
  }

  res.status(500).json(fallo('Error interno del servidor'));
};
