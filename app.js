const express = require('express');
require('dotenv').config();

const conectarDB = require('./config/db');
const { CARPETA_IMAGENES } = require('./config/imagenes');
const { estadios, ubicacion } = require('./routers/rutas');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/imagenes', express.static(CARPETA_IMAGENES));
app.use('/api/estadios', estadios);
app.use('/api/ubicacion', ubicacion);

app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: '200 OK: API de Estadios funcionando',
    endpoints: '/api/estadios y /api/ubicacion'
  });
});

const PORT = process.env.PORT || 9000;

const iniciarServidor = async () => {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Servidor web corriendo en http://localhost:${PORT}`);
  });
};

iniciarServidor();
