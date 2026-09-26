import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = process.env.PORT ?? 3000;

await connectDatabase(); // Conexión a la base de datos

app.listen(port, () => {
    console.log("Ultimo cambio");
    console.log('Servidor escuchando en el puerto ' + port );
});
