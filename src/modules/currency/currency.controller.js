import Currency from '../../models/currency.model.js';
import axios from 'axios';

/**
 * Obtiene las tasas de cambio actuales activas en el banco.
 */
export const getExchangeRates = async (req, res) => {
    try {
        const rates = await Currency.find();
        res.status(200).json({ status: 'success', data: rates });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Proxy para ejecutar el cambio de divisas entre dos cuentas (GTQ y USD) en BIK-Server-Admin.
 */
export const exchangeCurrency = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const response = await axios.post(
            process.env.ADMIN_SERVER_URL + '/api/currency/exchange',
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
 * Proxy para redimir un código de remesa internacional y acreditar los fondos.
 */
export const redeemRemittance = async (req, res) => {
    try {
        const token = req.header('Authorization');
        const response = await axios.post(
            process.env.ADMIN_SERVER_URL + '/api/currency/remittance/redeem',
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
