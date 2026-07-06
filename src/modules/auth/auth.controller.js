import axios from 'axios';
import User from '../../models/user.model.js';

/**
 * Proxy de inicio de sesión al BIK-Auth-Service (C#).
 * Valida credenciales y retorna el token JWT junto con datos del perfil del usuario.
 */
export const login = async (req, res) => {
    try {
        const { identificador, password } = req.body;

        if (!identificador || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Identificador y contraseña son requeridos.'
            });
        }

        const authResponse = await axios.post(
            process.env.AUTH_SERVICE_URL + '/api/auth/login',
            { identificador, password }
        );

        if (authResponse.data.status === 'success') {
            const { token, rol } = authResponse.data;

            // Solo permitir acceso a clientes en la app móvil
            if (rol !== 'Cliente') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Esta aplicación es exclusiva para clientes del banco. Personal administrativo debe usar el portal web.'
                });
            }

            // Obtener perfil completo del usuario
            let userData = null;
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                const user = await User.findByAnyId(payload.uid);
                if (user) {
                    userData = user;
                }
            } catch (e) {
                console.warn('Error obteniendo perfil del usuario:', e.message);
            }

            return res.status(200).json({
                status: 'success',
                token,
                rol,
                user: userData
            });
        }

        return res.status(401).json(authResponse.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Error de conexión con el servicio de autenticación.';
        res.status(status).json({ status: 'error', message });
    }
};

/**
 * Proxy de registro de nuevo cliente al ecosistema BIK.
 * Crea el perfil en la BD compartida y registra credenciales en el Auth-Service.
 */
export const register = async (req, res) => {
    try {
        const { dpi, email, telefono, password, ...userData } = req.body;

        // Validaciones básicas
        if (!dpi || !email || !telefono || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'DPI, correo, teléfono y contraseña son requeridos.'
            });
        }

        const existingUser = await User.findOne({ $or: [{ dpi }, { email }, { telefono }] });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'El DPI, Correo Electrónico o Teléfono ya están registrados.'
            });
        }

        const newUser = new User({ dpi, email, telefono, ...userData });
        await newUser.save();

        await axios.post(process.env.AUTH_SERVICE_URL + '/api/auth/register-credentials', {
            userId: newUser._id.toString(),
            dpi,
            email,
            telefono,
            password,
            rol: newUser.rol
        });

        res.status(201).json({
            status: 'success',
            message: 'Cuenta creada exitosamente. Tu perfil está en verificación.',
            data: newUser
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
