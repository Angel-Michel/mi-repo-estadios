const express = require('express');
const multiparty = require('connect-multiparty');
const multipartyMiddleware = multiparty();

const productoRouter = express.Router();
const almacenRouter = express.Router();
const ubicacionRouter = express.Router();

const {
  crearProducto,
  eliminarProducto,
  actualizarProducto,
  obtenerUnProducto,
  obtenerVariosProductos,
  subirImagenProducto,
  obtenerImagenProducto
} = require('../control/productoControl');

const {
  crearAlmacen,
  eliminarAlmacen,
  actualizarAlmacen,
  obtenerUnAlmacen,
  obtenerVariosAlmacenes
} = require('../control/almacenControl');

const { obtenerDondeEstoy } = require('../control/ubicacionControl');

productoRouter.post('/alta', crearProducto);
productoRouter.delete('/baja/:id', eliminarProducto);
productoRouter.delete('/eliminar/:id', eliminarProducto);
productoRouter.put('/actualizar/:id', actualizarProducto);
productoRouter.get('/obtenerUno/:id', obtenerUnProducto);
productoRouter.get('/obtenerVarios', obtenerVariosProductos);
productoRouter.post('/subirImagen/:id', multipartyMiddleware, subirImagenProducto);
productoRouter.get('/obtenerImagen/:id', obtenerImagenProducto);

almacenRouter.post('/alta', crearAlmacen);
almacenRouter.delete('/baja/:id', eliminarAlmacen);
almacenRouter.delete('/eliminar/:id', eliminarAlmacen);
almacenRouter.put('/actualizar/:id', actualizarAlmacen);
almacenRouter.get('/obtenerUno/:id', obtenerUnAlmacen);
almacenRouter.get('/obtenerVarios', obtenerVariosAlmacenes);

ubicacionRouter.get('/donde-estoy', obtenerDondeEstoy);

module.exports = {
  productos: productoRouter,
  almacen: almacenRouter,
  ubicacion: ubicacionRouter
};
