import Insurance from '../../models/insurance.model.js';
import User from '../../models/user.model.js';
import axios from 'axios';

/**
 * Obtiene las pólizas de seguro del usuario autenticado.
 */
export const getUserInsurances = async (req, res) => {
    try {
        // BE-045: Resolver uid a ObjectId correctamente
        const user = await User.findByAnyId(req.user.uid);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }
        const insurances = await Insurance.find({ usuarioId: user._id });
        res.status(200).json({ status: 'success', data: insurances });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Proxy para contratar una nueva póliza de seguro en BIK-Server-Admin.
 */
export const enrollInsurance = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const response = await axios.post(
            process.env.ADMIN_SERVER_URL + '/api/insurance/enroll',
            req.body,
            { headers: { Authorization: token } }
        );
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { status: 'error', message: error.message };
        res.status(status).json(data);
    }
};

/**
 * Proxy para actualizar una póliza de seguro (ej. cancelación) en BIK-Server-Admin.
 */
export const updateInsurance = async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.header('Authorization');
        const response = await axios.patch(
            process.env.ADMIN_SERVER_URL + `/api/insurance/${id}`,
            req.body,
            { headers: { Authorization: token } }
        );
        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { status: 'error', message: error.message };
        res.status(status).json(data);
    }
};
