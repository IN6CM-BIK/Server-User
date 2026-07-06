import Request from '../../models/request.model.js';
import Account from '../../models/account.model.js';
import User from '../../models/user.model.js';

/**
 * Crea una nueva gestión en línea vinculada al usuario autenticado.
 * BE-046: Resuelve uid a ObjectId correctamente.
 */
export const createRequest = async (req, res) => {
    try {
        // BE-046: Resolver uid a ObjectId
        const user = await User.findByAnyId(req.user.uid);
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        let cuentaId = null;
        if (req.body.cuentaVinculadaId) {
            const cuenta = await Account.findByAnyId(req.body.cuentaVinculadaId);
            if (cuenta) cuentaId = cuenta._id;
        }

        const { tipoGestion, descripcion, montoSolicitado, prioridad } = req.body;

        const newRequest = new Request({
            usuarioId: user._id,
            tipoGestion,
            descripcion,
            cuentaVinculadaId: cuentaId,
            montoSolicitado,
            prioridad
        });
        await newRequest.save();
        res.status(201).json({ status: 'success', data: newRequest });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Obtiene el historial de gestiones realizadas por el usuario actual.
 */
export const getUserRequests = async (req, res) => {
    try {
        // BE-047: Resolver uid a ObjectId correctamente
        const user = await User.findByAnyId(req.user.uid);
        if (!user) {
            return res.status(401).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        const requests = await Request.find({ usuarioId: user._id })
            .sort({ fechaSolicitud: -1 });
        res.status(200).json({ status: 'success', data: requests });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
