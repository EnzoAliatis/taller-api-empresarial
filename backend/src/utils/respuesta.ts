/**
 * Response Wrapper Pattern.
 *
 * Toda salida HTTP de la API —exitosa o fallida— usa una de estas dos formas,
 * discriminadas por el booleano `success`. El cliente nunca tiene que adivinar
 * la forma del payload.
 */

export interface DetalleError {
  campo: string;
  mensaje: string;
}

export interface RespuestaExitosa<T> {
  success: true;
  data: T;
}

export interface RespuestaFallida {
  success: false;
  error: {
    mensaje: string;
    detalles?: DetalleError[];
  };
}

export type Respuesta<T> = RespuestaExitosa<T> | RespuestaFallida;

/** Envuelve una carga útil como respuesta exitosa. */
export const exito = <T>(data: T): RespuestaExitosa<T> => ({
  success: true,
  data,
});

/** Envuelve un fallo, opcionalmente con el detalle campo por campo. */
export const fallo = (
  mensaje: string,
  detalles?: DetalleError[],
): RespuestaFallida => ({
  success: false,
  error: detalles ? { mensaje, detalles } : { mensaje },
});
