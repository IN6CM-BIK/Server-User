import rateLimit from 'express-rate-limit';

/**
 * SEC-004/SEC-012: Rate limiters para el gateway de banca móvil.
 * Más estricto que el Server-Admin por la naturaleza de las peticiones móviles.
 */

// Rate Limiter global para todas las llamadas API
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        status: 'error', 
        message: 'Demasiadas peticiones. Por favor, intente de nuevo en 15 minutos.' 
    }
});

// Rate Limiter estricto para endpoints de autenticación
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        status: 'error', 
        message: 'Demasiados intentos de autenticación. Por favor, intente de nuevo más tarde.' 
    }
});

// Rate Limiter para operaciones financieras
export const financialLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        status: 'error', 
        message: 'Demasiadas operaciones financieras. Por favor, espere un momento.' 
    }
});
