const path = require('path');

const CARPETA_IMAGENES = path.join(__dirname, '..', 'imagenes');
const EXTENSIONES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp'];
const TAMANO_MAXIMO = 5 * 1024 * 1024;

module.exports = { CARPETA_IMAGENES, EXTENSIONES_PERMITIDAS, TAMANO_MAXIMO };
