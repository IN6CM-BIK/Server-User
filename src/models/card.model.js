import mongoose from 'mongoose';
import crypto from 'crypto';

const cardSchema = new mongoose.Schema({
    publicId: { type: String, unique: true, default: () => crypto.randomUUID() },
    numeroTarjeta: { type: String, required: true, unique: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cuentaVinculadaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    tipo: { type: String, enum: ['Credito', 'Debito Digital', 'Debito Fisica'], required: true },
    limiteCredito: { type: Number, default: 0 },
    saldoUtilizado: { type: Number, default: 0 },
    fechaCorte: { type: Number },
    fechaPago: { type: Number },
    cvv: { type: String, required: true },
    fechaExpiracion: { type: String, required: true },
    configuraciones: {
        bloqueada: { type: Boolean, default: false },
        comprasInternacionales: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

cardSchema.statics.findByAnyId = function(id) {
    if (!id) return null;
    const query = { $or: [{ publicId: id }] };
    if (mongoose.Types.ObjectId.isValid(id)) {
        query.$or.push({ _id: id });
    }
    return this.findOne(query);
};

export default mongoose.model('Card', cardSchema);
