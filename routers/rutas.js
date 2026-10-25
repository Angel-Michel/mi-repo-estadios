const express = require('express');
const multiparty = require('connect-multiparty');
const multipartyMiddleware = multiparty();

const estadioRouter = express.Router();
const ubicacionRouter = express.Router();

const {
  crearEstadio,
  eliminarEstadio,
  actualizarEstadio,
  obtenerUnEstadio,
  obtenerVariosEstadios,
  subirImagenEstadio,
  obtenerImagenEstadio,
  eliminarImagenEstadio
} = require('../control/estadioControl');

const { obtenerDondeEstoy } = require('../control/ubicacionControl');

estadioRouter.post('/alta', crearEstadio);
estadioRouter.delete('/baja/:id', eliminarEstadio);
estadioRouter.delete('/eliminar/:id', eliminarEstadio);
estadioRouter.put('/actualizar/:id', actualizarEstadio);
estadioRouter.get('/obtenerUno/:id', obtenerUnEstadio);
estadioRouter.get('/obtenerVarios', obtenerVariosEstadios);
estadioRouter.post('/subirImagen/:id', multipartyMiddleware, subirImagenEstadio);
estadioRouter.get('/obtenerImagen/:id', obtenerImagenEstadio);
estadioRouter.delete('/eliminarImagen/:id', eliminarImagenEstadio);

ubicacionRouter.get('/donde-estoy', obtenerDondeEstoy);

module.exports = {
  estadios: estadioRouter,
  ubicacion: ubicacionRouter
};
