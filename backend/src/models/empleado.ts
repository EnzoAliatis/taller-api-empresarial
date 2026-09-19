import { Schema, model } from 'mongoose';

const empleadoSchema = new Schema(
  {
    nombre: { type: String, required: true },
    cargo: { type: String, required: true },
    departamento: { type: String, required: true },
    sueldo: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Empleado = model('Empleado', empleadoSchema);

/** Documento hidratado tal como lo devuelve el modelo. */
export type EmpleadoDocument = ReturnType<(typeof Empleado)['hydrate']>;

export default Empleado;
