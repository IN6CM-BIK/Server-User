import axios from 'axios';

/**
 * Proxy para pagar un servicio externo en BIK-Server-Admin.
 * Reutiliza idempotencia y lógica transaccional.
 */
export const payService = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const idempotencyKey = req.header('X-Idempotency-Key');

        const headers = { Authorization: token };
        if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

        const response = await axios.post(
            process.env.ADMIN_SERVER_URL + '/api/services/pay',
            req.body,
            { headers }
        );

        res.status(response.status).json(response.data);
    } catch (error) {
        const status = error.response?.status || 500;
        const data = error.response?.data || { status: 'error', message: error.message };
        res.status(status).json(data);
    }
};
