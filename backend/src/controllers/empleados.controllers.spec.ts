import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import { EmpleadoController } from './empleados.controllers.js';
import type { Empleado, IEmpleadoRepository } from '../repositories/empleado.repository.js';
import { exito, fallo } from '../utils/respuesta.js';
import { validar } from '../middlewares/validar.middleware.js';
import {
  actualizarEmpleadoSchema,
  crearEmpleadoSchema,
  empleadoIdParamSchema,
} from '../dtos/empleado.dto.js';

describe('🧪 Unit Test: EmpleadoController (Mantenibilidad & Testabilidad)', () => {
  let controller: EmpleadoController;
  let mockRepository: jest.Mocked<IEmpleadoRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  const empleadoFalso: Empleado = {
    id: '66f1a2b3c4d5e6f7a8b9c0d1',
    nombre: 'Andrés Mendoza',
    cargo: 'Arquitecto',
    departamento: 'TI',
    sueldo: 4000,
    createdAt: new Date('2026-09-01T00:00:00Z'),
    updatedAt: new Date('2026-09-01T00:00:00Z'),
  };

  beforeEach(() => {
    // 1. Mock 100% aislado de la interfaz (cero dependencia de Mongoose)
    mockRepository = {
      listar: jest.fn(),
      obtenerPorId: jest.fn(),
      crear: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
    };

    controller = new EmpleadoController(mockRepository);

    // 2. Mock de los objetos del ciclo de vida de Express
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = { status: statusMock } as unknown as Partial<Response>;
  });

  it('Debería retornar un estado 200 y la lista de empleados de la abstracción', async () => {
    const empleadosFalsos = [empleadoFalso];

    // Comportamiento esperado de la abstracción
    mockRepository.listar.mockResolvedValue(empleadosFalsos);
    mockRequest = {};

    await controller.getEmpleado(mockRequest as Request, mockResponse as Response);

    // Verificaciones del contrato (salida envuelta por el Response Wrapper)
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(exito(empleadosFalsos));
    expect(mockRepository.listar).toHaveBeenCalledTimes(1);
  });

  it('Debería retornar un estado 201 al crear un empleado', async () => {
    const { id, createdAt, updatedAt, ...datos } = empleadoFalso;
    mockRepository.crear.mockResolvedValue(empleadoFalso);
    mockRequest = { body: datos };

    await controller.addEmpleado(mockRequest as Request, mockResponse as Response);

    expect(mockRepository.crear).toHaveBeenCalledWith(datos);
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(exito(empleadoFalso));
  });

  it('Debería retornar un estado 404 si la abstracción no encuentra el empleado', async () => {
    mockRepository.obtenerPorId.mockResolvedValue(null);
    const request: Partial<Request<{ id: string }>> = { params: { id: empleadoFalso.id } };

    await controller.getEmpleadoPorId(
      request as Request<{ id: string }>,
      mockResponse as Response,
    );

    expect(mockRepository.obtenerPorId).toHaveBeenCalledWith(empleadoFalso.id);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(fallo('Empleado no encontrado'));
  });

  it('Debería rechazar con 400 un body inválido (Zod) sin llegar al controller ni a la abstracción', async () => {
    // Mismo payload corrupto del Flujo B de stress-test.yml
    mockRequest = { body: { nombre: 'Al', cargo: 'Dev', departamento: 'TI', sueldo: -500 } };
    const next = jest.fn(() =>
      controller.addEmpleado(mockRequest as Request, mockResponse as Response),
    );

    // Se encadena igual que en la ruta: validar(DTO) -> controller
    validar({ body: crearEmpleadoSchema })(
      mockRequest as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      fallo('Datos inválidos', [
        { campo: 'nombre', mensaje: 'El nombre debe tener al menos 3 caracteres' },
        { campo: 'sueldo', mensaje: 'El sueldo debe ser un número positivo' },
      ]),
    );
    expect(next).not.toHaveBeenCalled();
    expect(mockRepository.crear).not.toHaveBeenCalled();
  });

  it('Debería retornar un estado 200 al editar un empleado', async () => {
    const cambios = { sueldo: 4500 };
    const empleadoEditado = { ...empleadoFalso, ...cambios };
    mockRepository.actualizar.mockResolvedValue(empleadoEditado);
    const request: Partial<Request<{ id: string }>> = {
      params: { id: empleadoFalso.id },
      body: cambios,
    };

    await controller.updateEmpleado(
      request as Request<{ id: string }>,
      mockResponse as Response,
    );

    expect(mockRepository.actualizar).toHaveBeenCalledWith(empleadoFalso.id, cambios);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(exito(empleadoEditado));
  });

  it('Debería retornar un estado 404 al editar un empleado que no existe', async () => {
    mockRepository.actualizar.mockResolvedValue(null);
    const request: Partial<Request<{ id: string }>> = {
      params: { id: empleadoFalso.id },
      body: { sueldo: 4500 },
    };

    await controller.updateEmpleado(
      request as Request<{ id: string }>,
      mockResponse as Response,
    );

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(fallo('Empleado no encontrado'));
  });

  it('Debería rechazar con 400 una edición con id inválido y body vacío (Zod)', async () => {
    const request: Partial<Request<{ id: string }>> = { params: { id: 'abc' }, body: {} };
    const next = jest.fn(() =>
      controller.updateEmpleado(request as Request<{ id: string }>, mockResponse as Response),
    );

    validar({ params: empleadoIdParamSchema, body: actualizarEmpleadoSchema })(
      request as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      fallo('Datos inválidos', [
        { campo: 'id', mensaje: 'El id debe ser un ObjectId válido de 24 caracteres hexadecimales' },
        { campo: '(raíz)', mensaje: 'Debe enviar al menos un campo para actualizar' },
      ]),
    );
    expect(next).not.toHaveBeenCalled();
    expect(mockRepository.actualizar).not.toHaveBeenCalled();
  });

  it('Debería retornar un estado 200 al eliminar un empleado', async () => {
    mockRepository.eliminar.mockResolvedValue(true);
    const request: Partial<Request<{ id: string }>> = { params: { id: empleadoFalso.id } };

    await controller.deleteEmpleado(
      request as Request<{ id: string }>,
      mockResponse as Response,
    );

    expect(mockRepository.eliminar).toHaveBeenCalledWith(empleadoFalso.id);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(exito({ id: empleadoFalso.id }));
  });

  it('Debería retornar un estado 404 al eliminar un empleado que no existe', async () => {
    mockRepository.eliminar.mockResolvedValue(false);
    const request: Partial<Request<{ id: string }>> = { params: { id: empleadoFalso.id } };

    await controller.deleteEmpleado(
      request as Request<{ id: string }>,
      mockResponse as Response,
    );

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith(fallo('Empleado no encontrado'));
  });

  it('Debería rechazar con 400 una eliminación con id inválido (Zod)', async () => {
    const request: Partial<Request<{ id: string }>> = { params: { id: '123' } };
    const next = jest.fn(() =>
      controller.deleteEmpleado(request as Request<{ id: string }>, mockResponse as Response),
    );

    validar({ params: empleadoIdParamSchema })(
      request as Request,
      mockResponse as Response,
      next as NextFunction,
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      fallo('Datos inválidos', [
        { campo: 'id', mensaje: 'El id debe ser un ObjectId válido de 24 caracteres hexadecimales' },
      ]),
    );
    expect(next).not.toHaveBeenCalled();
    expect(mockRepository.eliminar).not.toHaveBeenCalled();
  });
});
