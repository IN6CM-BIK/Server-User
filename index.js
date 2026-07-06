import dotenv from 'dotenv';
import app from './src/configs/app.js';
import { connectDB } from './src/configs/db.js';

dotenv.config();

/**
 * Punto de entrada principal del servidor de banca móvil.
 * Inicializa la conexión a datos y el servicio HTTP.
 */
const startServer = async () => {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`📱 BIK Server User: Banca Móvil Activa 📱`);
            console.log(`Puerto: ${PORT} | Modo: ${process.env.NODE_ENV}`);
            console.log(`=========================================`);
        });
    } catch (error) {
        console.error('Fallo crítico en el inicio:', error);
        process.exit(1);
    }
};

startServer();
