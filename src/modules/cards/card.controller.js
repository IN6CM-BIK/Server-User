import Card from '../../models/card.model.js';
import User from '../../models/user.model.js';

/**
 * Obtiene todas las tarjetas (débito y crédito) del cliente autenticado.
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
 * Alterna el estado de bloqueo temporal de una tarjeta.
 * SEC-008: Verificación de propiedad.
 */
export const toggleFreeze = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const card = await Card.findByAnyId(id);
        if (!card || card.usuarioId.toString() !== user._id.toString()) {
            return res.status(404).json({ status: 'error', message: 'Tarjeta no encontrada.' });
        }

        card.configuraciones.bloqueada = !card.configuraciones.bloqueada;
        await card.save();

        res.status(200).json({
            status: 'success',
            message: card.configuraciones.bloqueada ? 'Tarjeta bloqueada temporalmente.' : 'Tarjeta desbloqueada.',
            data: card
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

/**
 * Actualiza las configuraciones de una tarjeta (compras internacionales).
 * SEC-008: Verificación de propiedad.
 */
export const updateCardConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByAnyId(req.user.uid);
        if (!user) throw new Error('Usuario no encontrado.');

        const card = await Card.findByAnyId(id);
        if (!card || card.usuarioId.toString() !== user._id.toString()) {
            return res.status(404).json({ status: 'error', message: 'Tarjeta no encontrada.' });
        }

        if (req.body.comprasInternacionales !== undefined) {
            card.configuraciones.comprasInternacionales = req.body.comprasInternacionales;
        }
        await card.save();

        res.status(200).json({ status: 'success', data: card });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
