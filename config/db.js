const mongoose = require('mongoose');
require('dotenv').config();

const conectarDB = async () => {

  const atlasURI = process.env.MONGODB_URI;
  const localURI = `mongodb://localhost:27017/${process.env.DB_NAME}`;

  try {
    // Intentar conexión con MongoDB Atlas
    console.log('Intentando conectar con MongoDB Atlas...');

    await mongoose.connect(atlasURI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(
      `MongoDB conectado a Atlas. Base de datos: ${mongoose.connection.name}`
    );

  } catch (errorAtlas) {

    console.log('Atlas no disponible.');
    console.log('Intentando conexión con MongoDB local...');

    try {
      // Intentar conexión local
      await mongoose.connect(localURI, {
        serverSelectionTimeoutMS: 5000
      });

      console.log(
        `MongoDB conectado localmente. Base de datos: ${mongoose.connection.name}`
      );

    } catch (errorLocal) {

      console.error('Error al conectar con MongoDB Atlas:', errorAtlas.message);
      console.error('Error al conectar con MongoDB local:', errorLocal.message);

      process.exit(1);
    }
  }
};

module.exports = conectarDB;