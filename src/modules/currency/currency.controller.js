import Currency from '../../models/currency.model.js';
import axios from 'axios';

/**
 * Obtiene las tasas de cambio actuales activas en el banco.
 */
export const getExchangeRates = async (req, res) => {
    try {
        const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TipoCambioDia xmlns="http://www.banguat.gob.gt/variables/ws/" />
  </soap:Body>
</soap:Envelope>`;

        try {
            const banguatRes = await axios.post(
                'https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx',
                soapEnvelope,
                {
                    headers: {
                        'Content-Type': 'text/xml; charset=utf-8',
                        'SOAPAction': 'http://www.banguat.gob.gt/variables/ws/TipoCambioDia'
                    },
                    timeout: 4000
                }
            );

            const xmlData = banguatRes.data;
            const compraMatch = xmlData.match(/<compra>([\d.]+)<\/compra>/);
            const ventaMatch = xmlData.match(/<venta>([\d.]+)<\/venta>/);

            if (compraMatch && ventaMatch) {
                const tasaCompra = parseFloat(compraMatch[1]);
                const tasaVenta = parseFloat(ventaMatch[1]);

                // Actualizamos o creamos la tasa de cambio en caché local de BD
                await Currency.findOneAndUpdate(
                    { monedaDestino: 'GTQ' },
                    { 
                        monedaBase: 'USD',
                        monedaDestino: 'GTQ',
                        tasaCompra, 
                        tasaVenta, 
                        fechaActualizacion: new Date() 
                    },
                    { upsert: true, new: true }
                );
            }
        } catch (err) {
            console.warn('Advertencia: No se pudo conectar a la API del Banco de Guatemala. Usando respaldo de BD:', err.message);
        }

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
