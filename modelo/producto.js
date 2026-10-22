const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  ubicacion: { type: String, required: true },
  precio: { type: Number, required: true },
  almacen: { type: mongoose.Schema.Types.ObjectId, ref: 'Almacen', required: true },
  imagen: { type: String },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Producto', productoSchema);
