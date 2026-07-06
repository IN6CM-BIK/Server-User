import User from '../../models/user.model.js';
import axios from 'axios';

/**
 * Obtiene el perfil completo del usuario autenticado.
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findByAnyId(req.user.uid);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ status: 'success', data: user });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Actualiza la información demográfica permitida del perfil del cliente.
 */
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findByAnyId(req.user.uid);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
        }

        // SEC-015: Whitelist explícita de campos permitidos
        const allowedFields = ['nombres', 'apellidos', 'direccion', 'telefono', 'email', 'ingresosMensuales',
            'fotoDpiAdelanteUrl', 'fotoDpiAtrasUrl', 'fotoRostroUrl', 'fechaNacimiento'];
        const updateData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, updateData, { new: true, runValidators: true });

        res.status(200).json({ status: 'success', data: updatedUser });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Cambia la contraseña activa del usuario mediante el puente de microservicios de seguridad.
 */
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'La contraseña actual y la nueva son requeridas.'
            });
        }

        const userId = req.user.uid;

        const authResponse = await axios.put(process.env.AUTH_SERVICE_URL + '/api/auth/change-password', {
            userId,
            currentPassword,
            newPassword
        });

        res.status(200).json(authResponse.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        res.status(status).json({ status: 'error', message });
    }
};
