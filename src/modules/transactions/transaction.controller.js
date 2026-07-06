import axios from 'axios';
import Transaction from '../../models/transaction.model.js';
import Account from '../../models/account.model.js';
import User from '../../models/user.model.js';

/**
 * Obtiene el historial de transacciones del usuario autenticado.
 * Consulta directa a la BD compartida para eficiencia.
 */
export const getUserTransactions = async (req, res) => {
    try {
        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const accounts = await Account.find({ usuarioId: user._id });
        const accountIds = accounts.map(a => a._id);

        const { page = 1, limit = 20, tipo } = req.query;
        const query = {
            $or: [
                { cuentaOrigenId: { $in: accountIds } },
                { cuentaDestinoId: { $in: accountIds } }
            ]
        };
        if (tipo) query.tipo = tipo;

        const total = await Transaction.countDocuments(query);
        const transactions = await Transaction.find(query)
            .populate('cuentaOrigenId', 'numeroCuenta tipo moneda')
            .populate('cuentaDestinoId', 'numeroCuenta tipo moneda')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.status(200).json({
            status: 'success',
            data: transactions,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Proxy de transferencia interna BIK al Server-Admin.
 * Reutiliza la lógica de idempotencia, atomicidad y auditoría del Server-Admin.
 */
export const transferInternal = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const idempotencyKey = req.header('X-Idempotency-Key');

        const headers = { Authorization: token };
        if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

        const response = await axios.post(
            process.env.ADMIN_SERVER_URL + '/api/transactions/transfer',
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

/**
 * Proxy de transferencia ACH (otros bancos) al Server-Admin.
 */
export const transferACH = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const idempotencyKey = req.header('X-Idempotency-Key');

        const headers = { Authorization: token };
        if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

        const response = await axios.post(
            process.env.ADMIN_SERVER_URL + '/api/transactions/ach',
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

/**
 * Proxy de transferencia internacional al Server-Admin.
 */
export const transferInternational = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const idempotencyKey = req.header('X-Idempotency-Key');

        const headers = { Authorization: token };
        if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

        const response = await axios.post(
            process.env.ADMIN_SERVER_URL + '/api/transactions/international',
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

/**
 * Proxy de transferencia móvil al Server-Admin.
 */
export const transferMobile = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const idempotencyKey = req.header('X-Idempotency-Key');

        const headers = { Authorization: token };
        if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

        const response = await axios.post(
            process.env.ADMIN_SERVER_URL + '/api/transactions/mobile',
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
