import { Router } from 'express';
import type { EmpleadoController } from '../controllers/empleados.controllers.js';
import {
  actualizarEmpleadoSchema,
  crearEmpleadoSchema,
  empleadoIdParamSchema,
} from '../dtos/empleado.dto.js';
import { validar } from '../middlewares/validar.middleware.js';

export const crearEmpleadosRouter = (empleado: EmpleadoController): Router => {
  const router = Router();

  router.get('/empleados', empleado.getEmpleado);

  router.get(
    '/empleados/:id',
    validar({ params: empleadoIdParamSchema }),
    empleado.getEmpleadoPorId,
  );

  router.post(
    '/empleados',
    validar({ body: crearEmpleadoSchema }),
    empleado.addEmpleado,
  );

  router.patch(
    '/empleados/:id',
    validar({ params: empleadoIdParamSchema, body: actualizarEmpleadoSchema }),
    empleado.updateEmpleado,
  );

  router.delete(
    '/empleados/:id',
    validar({ params: empleadoIdParamSchema }),
    empleado.deleteEmpleado,
  );

  return router;
};
