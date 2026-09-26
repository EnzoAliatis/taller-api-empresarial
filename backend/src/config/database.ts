// src/config/database.ts
import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  // const MONGO_URI = 'mongodb://127.0.0.1/usuarios_db';
  const MONGO_URI = 'mongodb+srv://maestria:maestria@maestria-mongo.wrsshws.mongodb.net/?appName=maestria-mongo';
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔄 [Database]: Conexión exitosa a MongoDB ATLAS');
  } catch (error) {
    console.error('❌ Error crítico al conectar a la base de datos:', error);
    process.exit(1);
  }
};
    