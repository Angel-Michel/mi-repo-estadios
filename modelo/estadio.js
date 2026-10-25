const mongoose = require('mongoose');

const estadioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  capacidad: { type: Number, required: true, min: 0 },
  ubicacion: { type: String, required: true, trim: true },
  equipoLocal: { type: String, required: true, trim: true },
  imagen: { type: String },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Estadio', estadioSchema);
