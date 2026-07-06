/**
 * Middleware de verificación de rol de cliente.
 * Garantiza que solo usuarios con rol 'Cliente' puedan acceder
 * a los endpoints del gateway de banca móvil.
 * Este middleware es el inverso del `isAdmin`/`isStaff` del Server-Admin.
 */
export const isClient = (req, res, next) => {
    if (!req.user) {
        return res.status(500).json({
            status: 'error',
            message: 'Se intentó verificar el rol sin validar el token primero.'
        });
    }

    if (req.user.rol !== 'Cliente') {
        return res.status(403).json({
            status: 'error',
            message: 'Acceso denegado. Este portal es exclusivo para clientes del banco.'
        });
    }

    next();
};
