import { z } from 'zod';

/**
 * Esquemas declarativos de validación perimetral.
 * Blindan `req.body` y `req.params` antes de que la petición llegue al controller.
 */

const ID_MONGO = /^[0-9a-fA-F]{24}$/;

/** Valida el `:id` de la URL: debe ser un ObjectId bien formado. */
export const empleadoIdParamSchema = z.object({
  id: z
    .string()
    .regex(ID_MONGO, 'El id debe ser un ObjectId válido de 24 caracteres hexadecimales'),
});

/** Valida el body de creación: todos los campos son obligatorios. */
export const crearEmpleadoSchema = z.object({
  nombre: z
    .string('El nombre es obligatorio')
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(80, 'El nombre no puede superar los 80 caracteres'),
  cargo: z
    .string('El cargo es obligatorio')
    .trim()
    .min(3, 'El cargo debe tener al menos 3 caracteres')
    .max(80, 'El cargo no puede superar los 80 caracteres'),
  departamento: z
    .string('El departamento es obligatorio')
    .trim()
    .min(2, 'El departamento debe tener al menos 2 caracteres')
    .max(80, 'El departamento no puede superar los 80 caracteres'),
  sueldo: z
    .number('El sueldo es obligatorio y debe ser numérico')
    .positive('El sueldo debe ser un número positivo'),
});

/**
 * Valida el body de actualización parcial (PATCH):
 * todos los campos son opcionales, pero al menos uno debe venir.
 */
export const actualizarEmpleadoSchema = crearEmpleadoSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar',
  });

export type CrearEmpleadoDto = z.infer<typeof crearEmpleadoSchema>;
export type ActualizarEmpleadoDto = z.infer<typeof actualizarEmpleadoSchema>;
export type EmpleadoIdParamDto = z.infer<typeof empleadoIdParamSchema>;
