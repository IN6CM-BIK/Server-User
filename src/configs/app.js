import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import authRoutes from '../modules/auth/auth.routes.js';
import profileRoutes from '../modules/profile/profile.routes.js';
import accountRoutes from '../modules/accounts/account.routes.js';
import transactionRoutes from '../modules/transactions/transaction.routes.js';
import cardRoutes from '../modules/cards/card.routes.js';
import contactRoutes from '../modules/contacts/contact.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import currencyRoutes from '../modules/currency/currency.routes.js';
import requestRoutes from '../modules/requests/request.routes.js';
import insuranceRoutes from '../modules/insurance/insurance.routes.js';
import qrRoutes from '../modules/qr/qr.routes.js';
import serviceRoutes from '../modules/services/service.routes.js';
import { setupSwagger } from './swagger.js';

const app = express();

// BE-055: Compresión de respuestas HTTP
app.use(compression());

// BE-057: Configuración de Content Security Policy (CSP) robusta usando Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:5000", "http://localhost:3000", "http://localhost:5213"]
        }
    }
}));

/**
 * Configuración CORS para la aplicación móvil.
 * Acepta peticiones desde cualquier origen ya que los clientes nativos
 * (React Native) no envían cabecera Origin en las peticiones HTTP.
 */
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
    credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// BE-054: Morgan solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

import { globalLimiter } from '../middlewares/rate-limiter.js';
app.use(globalLimiter);

/**
 * Registro de todas las rutas del gateway de banca móvil BIK.
 */
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/services', serviceRoutes);

// SEC-024: Swagger solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
}

/**
 * Endpoint de verificación de disponibilidad del sistema.
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'BIK Server User - Banca Móvil Operativa'
    });
});

/**
 * SEC-025: Middleware global de manejo de errores.
 * Captura errores no controlados y devuelve una respuesta segura.
 */
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err.message);
    
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : err.message;

    res.status(statusCode).json({
        status: 'error',
        message
    });
});

export default app;
