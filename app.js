const express = require('express');
require('dotenv').config();
const path = require('path');

const conectarDB = require('./config/db');
const { productos, almacen, ubicacion } = require('./routers/rutas');

const app = express();

app.use(express.json()); //recibe datos en formato JSON
app.use(express.urlencoded({ extended: true })); //recibir datos de formularios
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
app.use('/productos', productos);
app.use('/almacen', almacen);
app.use('/ubicacion', ubicacion);

app.get('/', (req, res) => {
  res.status(200).json({ mensaje: '200 OK: API funcionando en http://localhost:8080/productos y /almacen' });
});

const PORT = process.env.PORT || 9000;

const iniciarServidor = async () => {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Servidor web corriendo en http://localhost:${PORT}`);
  });
};

iniciarServidor();
