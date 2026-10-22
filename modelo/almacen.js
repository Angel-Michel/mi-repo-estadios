const mongoose = require('mongoose');

const almacenSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    ubicacion: { type: String, required: true },
    fechaCreacion: { type: Date, default: Date.now }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

almacenSchema.virtual('productos', {
  ref: 'Producto',
  localField: '_id',
  foreignField: 'almacen'
});

module.exports = mongoose.model('Almacen', almacenSchema);
