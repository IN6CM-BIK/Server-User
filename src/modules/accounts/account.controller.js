import Account from '../../models/account.model.js';
import Card from '../../models/card.model.js';
import Transaction from '../../models/transaction.model.js';
import User from '../../models/user.model.js';

/**
 * Obtiene todas las cuentas bancarias del cliente autenticado.
 */
export const getUserAccounts = async (req, res) => {
    try {
        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const accounts = await Account.find({ usuarioId: user._id }).sort({ isFavorite: -1, createdAt: -1 });
        res.status(200).json({ status: 'success', data: accounts });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Obtiene las tarjetas asociadas al cliente autenticado.
 */
export const getUserCards = async (req, res) => {
    try {
        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const cards = await Card.find({ usuarioId: user._id });
        res.status(200).json({ status: 'success', data: cards });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Obtiene un resumen consolidado: cuentas, tarjetas y transacciones recientes del usuario.
 * Optimizado para la pantalla principal (dashboard) de la app móvil.
 */
export const getDashboard = async (req, res) => {
    try {
        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const accounts = await Account.find({ usuarioId: user._id }).sort({ isFavorite: -1 });
        const cards = await Card.find({ usuarioId: user._id });

        const accountIds = accounts.map(a => a._id);

        const recentTransactions = await Transaction.find({
            $or: [
                { cuentaOrigenId: { $in: accountIds } },
                { cuentaDestinoId: { $in: accountIds } }
            ]
        })
            .populate('cuentaOrigenId', 'numeroCuenta tipo moneda')
            .populate('cuentaDestinoId', 'numeroCuenta tipo moneda')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            status: 'success',
            data: { user, accounts, cards, recentTransactions }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Alterna el estado de favorito de una cuenta específica.
 */
export const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const account = await Account.findByAnyId(id);
        if (!account || account.usuarioId.toString() !== user._id.toString()) {
            return res.status(404).json({ status: 'error', message: 'Cuenta no encontrada.' });
        }

        account.isFavorite = !account.isFavorite;
        await account.save();

        res.status(200).json({ status: 'success', data: account });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Obtiene las transacciones recientes de una cuenta específica del usuario.
 */
export const getAccountTransactions = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const account = await Account.findByAnyId(id);
        if (!account || account.usuarioId.toString() !== user._id.toString()) {
            return res.status(404).json({ status: 'error', message: 'Cuenta no encontrada.' });
        }

        const transactions = await Transaction.find({
            $or: [
                { cuentaOrigenId: account._id },
                { cuentaDestinoId: account._id }
            ]
        })
            .populate('cuentaOrigenId', 'numeroCuenta tipo moneda')
            .populate('cuentaDestinoId', 'numeroCuenta tipo moneda')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ status: 'success', data: transactions });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Valida que una cuenta destino exista, esté activa y retorna el nombre completo del titular.
 * Usado por la app móvil para verificar el destinatario antes de confirmar una transferencia.
 */
export const validateDestinationAccount = async (req, res) => {
    try {
        const { numeroCuenta } = req.params;

        if (!numeroCuenta || numeroCuenta.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'El número de cuenta debe tener al menos 6 dígitos.'
            });
        }

        const account = await Account.findOne({ numeroCuenta });
        if (!account) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró una cuenta con ese número.'
            });
        }

        if (account.estado !== 'Activa') {
            return res.status(400).json({
                status: 'error',
                message: `La cuenta se encuentra en estado "${account.estado}" y no puede recibir transferencias.`
            });
        }

        // Obtener nombre completo del titular
        const titular = await User.findById(account.usuarioId);
        if (!titular) {
            return res.status(400).json({
                status: 'error',
                message: 'No se pudo verificar el titular de la cuenta destino.'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                numeroCuenta: account.numeroCuenta,
                tipo: account.tipo,
                moneda: account.moneda,
                titularNombre: `${titular.nombres} ${titular.apellidos}`
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Actualiza el alias personalizado de una cuenta del usuario autenticado.
 */
export const updateAccountAlias = async (req, res) => {
    try {
        const { id } = req.params;
        const { alias } = req.body;

        if (alias === undefined || alias === null) {
            return res.status(400).json({ status: 'error', message: 'El alias es requerido.' });
        }

        if (alias.length > 50) {
            return res.status(400).json({ status: 'error', message: 'El alias no puede exceder 50 caracteres.' });
        }

        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const account = await Account.findByAnyId(id);
        if (!account || account.usuarioId.toString() !== user._id.toString()) {
            return res.status(404).json({ status: 'error', message: 'Cuenta no encontrada.' });
        }

        account.alias = alias;
        await account.save();

        res.status(200).json({ status: 'success', data: account });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Permite al cliente congelar o descongelar su propia cuenta por seguridad.
 * Solo aplica a cuentas en estado 'Activa' o 'Congelada'.
 */
export const freezeOwnAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const account = await Account.findByAnyId(id);
        if (!account || account.usuarioId.toString() !== user._id.toString()) {
            return res.status(404).json({ status: 'error', message: 'Cuenta no encontrada.' });
        }

        if (account.estado !== 'Activa' && account.estado !== 'Congelada') {
            return res.status(400).json({
                status: 'error',
                message: `No se puede modificar una cuenta en estado "${account.estado}".`
            });
        }

        account.estado = account.estado === 'Congelada' ? 'Activa' : 'Congelada';
        await account.save();

        res.status(200).json({ status: 'success', data: account });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Actualiza el límite de transferencia diario de una cuenta del usuario autenticado.
 */
export const updateOwnTransferLimit = async (req, res) => {
    try {
        const { id } = req.params;
        const { limiteTransferenciaDiario } = req.body;

        if (!limiteTransferenciaDiario || limiteTransferenciaDiario <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'El límite debe ser un número positivo.'
            });
        }

        if (limiteTransferenciaDiario > 100000) {
            return res.status(400).json({
                status: 'error',
                message: 'El límite máximo permitido es Q100,000.00.'
            });
        }

        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const account = await Account.findByAnyId(id);
        if (!account || account.usuarioId.toString() !== user._id.toString()) {
            return res.status(404).json({ status: 'error', message: 'Cuenta no encontrada.' });
        }

        account.limiteTransferenciaDiario = Number(limiteTransferenciaDiario);
        await account.save();

        res.status(200).json({ status: 'success', data: account });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
