import type { Request, Response } from 'express';
import type { IEmpleadoRepository } from '../repositories/empleado.repository.js';
import { exito, fallo } from '../utils/respuesta.js';

/**
 * Capa de red. Solo conoce la abstracción `IEmpleadoRepository`:
 * no importa Mongoose, ni el modelo, ni sabe qué motor hay detrás.
 * Todas sus salidas pasan por el Response Wrapper.
 */
export class EmpleadoController {
  constructor(private readonly repositorio: IEmpleadoRepository) {}

  getEmpleado = async (_req: Request, res: Response): Promise<void> => {
    const empleados = await this.repositorio.listar();
    res.json(exito(empleados));
  };

  getEmpleadoPorId = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;
    const empleado = await this.repositorio.obtenerPorId(id);

    if (!empleado) {
      res.status(404).json(fallo('Empleado no encontrado'));
      return;
    }

    res.json(exito(empleado));
  };

  addEmpleado = async (req: Request, res: Response): Promise<void> => {
    const empleado = await this.repositorio.crear(req.body);
    res.json(exito(empleado));
  };

  updateEmpleado = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;
    const empleado = await this.repositorio.actualizar(id, req.body);

    if (!empleado) {
      res.status(404).json(fallo('Empleado no encontrado'));
      return;
    }

    res.json(exito(empleado));
  };

  deleteEmpleado = async (
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;
    const eliminado = await this.repositorio.eliminar(id);

    if (!eliminado) {
      res.status(404).json(fallo('Empleado no encontrado'));
      return;
    }

    res.json(exito({ id }));
  };
}
