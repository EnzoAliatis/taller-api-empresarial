import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { EmpleadoController } from './controllers/empleados.controllers.js';
import {
  manejadorErrores,
  rutaNoEncontrada,
} from './middlewares/error.middleware.js';
import { EmpleadoMongooseImplementation } from './repositories/empleado.mongoose.implementation.js';
import type { IEmpleadoRepository } from './repositories/empleado.repository.js';
import { crearEmpleadosRouter } from './routes/empleados.routes.js';

const app = express();

//settings
app.set('nombreApp', 'Gestión de empleados');

//middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

//composition root: único lugar donde se elige la implementación concreta
const empleadoRepository: IEmpleadoRepository = new EmpleadoMongooseImplementation();
const empleadoController = new EmpleadoController(empleadoRepository);

//routes
app.use('/api/v1', crearEmpleadosRouter(empleadoController));

//demo: tumba el proceso para ver cómo PM2 lo vuelve a levantar
app.get('/api/v1/crash', (_req, res) => {
  console.error(`💥 [Crash]: proceso ${process.pid} terminado a propósito`);
  res.status(200).json({ mensaje: `Proceso ${process.pid} terminado` });
  setTimeout(() => process.exit(1), 100);
});

//interceptores: siempre al final, después de las rutas
app.use(rutaNoEncontrada);
app.use(manejadorErrores);

export default app;
