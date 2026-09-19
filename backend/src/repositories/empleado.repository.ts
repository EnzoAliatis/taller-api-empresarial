/**
 * Contrato de persistencia para empleados.
 *
 * Es una abstracción pura: no conoce Mongoose ni ningún motor de base de datos.
 * `id` es un string plano, no un ObjectId, para que la capa de aplicación
 * dependa de esta interfaz y nunca del ODM.
 */

export interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CrearEmpleadoData = Omit<Empleado, 'id' | 'createdAt' | 'updatedAt'>;

export type ActualizarEmpleadoData = Partial<CrearEmpleadoData>;

export interface IEmpleadoRepository {
  listar(): Promise<Empleado[]>;
  obtenerPorId(id: string): Promise<Empleado | null>;
  crear(data: CrearEmpleadoData): Promise<Empleado>;
  actualizar(id: string, data: ActualizarEmpleadoData): Promise<Empleado | null>;
  eliminar(id: string): Promise<boolean>;
}
