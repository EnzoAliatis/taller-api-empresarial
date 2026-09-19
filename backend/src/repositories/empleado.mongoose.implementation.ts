import Empleado from '../models/empleado.js';
import type { EmpleadoDocument } from '../models/empleado.js';
import type {
  ActualizarEmpleadoData,
  CrearEmpleadoData,
  Empleado as EmpleadoEntidad,
  IEmpleadoRepository,
} from './empleado.repository.js';

/**
 * Adaptador de persistencia con Mongoose.
 *
 * Es la única clase que conoce el ODM: traduce documentos de Mongoose a
 * entidades planas del dominio, de modo que quien dependa de
 * `IEmpleadoRepository` nunca vea un Document ni un ObjectId.
 */
export class EmpleadoMongooseImplementation implements IEmpleadoRepository {
  async listar(): Promise<EmpleadoEntidad[]> {
    const documentos = await Empleado.find();
    return documentos.map((documento) => this.aEntidad(documento));
  }

  async obtenerPorId(id: string): Promise<EmpleadoEntidad | null> {
    const documento = await Empleado.findById(id);
    return documento ? this.aEntidad(documento) : null;
  }

  async crear(data: CrearEmpleadoData): Promise<EmpleadoEntidad> {
    const documento = await Empleado.create(data);
    return this.aEntidad(documento);
  }

  async actualizar(
    id: string,
    data: ActualizarEmpleadoData,
  ): Promise<EmpleadoEntidad | null> {
    const documento = await Empleado.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    });
    return documento ? this.aEntidad(documento) : null;
  }

  async eliminar(id: string): Promise<boolean> {
    const documento = await Empleado.findByIdAndDelete(id);
    return documento !== null;
  }

  /** Mapea un documento de Mongoose a la entidad de dominio. */
  private aEntidad(documento: EmpleadoDocument): EmpleadoEntidad {
    return {
      id: documento._id.toString(),
      nombre: documento.nombre,
      cargo: documento.cargo,
      departamento: documento.departamento,
      sueldo: documento.sueldo,
      createdAt: documento.createdAt,
      updatedAt: documento.updatedAt,
    };
  }
}
