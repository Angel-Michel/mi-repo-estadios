const Estadio = require('../modelo/estadio');
const path = require('path');
const fs = require('fs').promises;
const { CARPETA_IMAGENES, EXTENSIONES_PERMITIDAS, TAMANO_MAXIMO } = require('../config/imagenes');

const datosEstadio = (body) => {
  const capacidad = Number(body.capacidad);
  return {
    nombre: body.nombre,
    capacidad,
    ubicacion: body.ubicacion,
    equipoLocal: body.equipoLocal
  };
};

const validarDatos = ({ nombre, capacidad, ubicacion, equipoLocal }) => {
  if (!nombre || !ubicacion || !equipoLocal || !Number.isFinite(capacidad) || capacidad < 0) {
    return '400 Bad Request: faltan campos requeridos o la capacidad es invalida';
  }
  return null;
};

const borrarArchivoImagen = async (rutaRelativa) => {
  if (!rutaRelativa) return;

  const rutaAbsoluta = path.join(CARPETA_IMAGENES, path.basename(rutaRelativa));

  try {
    await fs.unlink(rutaAbsoluta);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`No se pudo eliminar la imagen ${rutaAbsoluta}: ${error.message}`);
    }
  }
};

const crearEstadio = async (req, res) => {
  try {
    const datos = datosEstadio(req.body);
    const errorValidacion = validarDatos(datos);

    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const estadio = new Estadio(datos);
    await estadio.save();

    return res.status(200).json({ mensaje: '200 OK: estadio creado', estadio });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: '400 Bad Request: datos invalidos', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const eliminarEstadio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del estadio' });
    }

    const estadio = await Estadio.findByIdAndDelete(id);

    if (!estadio) {
      return res.status(400).json({ mensaje: '400 Bad Request: estadio no encontrado' });
    }

    await borrarArchivoImagen(estadio.imagen);

    return res.status(200).json({ mensaje: '200 OK: estadio eliminado', estadio });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const actualizarEstadio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del estadio' });
    }

    const datos = datosEstadio(req.body);
    const errorValidacion = validarDatos(datos);

    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const estadio = await Estadio.findByIdAndUpdate(id, datos, { new: true, runValidators: true });

    if (!estadio) {
      return res.status(400).json({ mensaje: '400 Bad Request: estadio no encontrado' });
    }

    return res.status(200).json({ mensaje: '200 OK: estadio actualizado', estadio });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: '400 Bad Request: datos invalidos', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const obtenerUnEstadio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del estadio' });
    }

    const estadio = await Estadio.findById(id);

    if (!estadio) {
      return res.status(400).json({ mensaje: '400 Bad Request: estadio no encontrado' });
    }

    return res.status(200).json({ mensaje: '200 OK: estadio encontrado', estadio });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const obtenerVariosEstadios = async (req, res) => {
  try {
    const { equipoLocal, ubicacion } = req.query;
    const filtro = {};

    if (equipoLocal) filtro.equipoLocal = equipoLocal;
    if (ubicacion) filtro.ubicacion = ubicacion;

    const estadios = await Estadio.find(filtro).sort({ nombre: 1 });

    return res.status(200).json({ mensaje: '200 OK: lista de estadios', estadios });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: filtro invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const subirImagenEstadio = async (req, res) => {
  let archivo;

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del estadio' });
    }

    const estadio = await Estadio.findById(id);

    if (!estadio) {
      return res.status(400).json({ mensaje: '400 Bad Request: estadio no encontrado' });
    }

    if (!req.files || !req.files.imagen) {
      return res.status(400).json({ mensaje: '400 Bad Request: no se envio ningun archivo, use el campo "imagen"' });
    }

    archivo = req.files.imagen;
    const extension = path.extname(archivo.name).toLowerCase();

    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      return res.status(400).json({
        mensaje: `400 Bad Request: formato no permitido. Use ${EXTENSIONES_PERMITIDAS.join(', ')}`
      });
    }

    if (archivo.size > TAMANO_MAXIMO) {
      return res.status(400).json({ mensaje: '400 Bad Request: la imagen supera el tamano maximo de 5 MB' });
    }

    const nombreUnico = `${id}_${Date.now()}${extension}`;
    const rutaDestino = path.join(CARPETA_IMAGENES, nombreUnico);

    await fs.copyFile(archivo.path, rutaDestino);

    const imagenAnterior = estadio.imagen;
    const rutaRelativa = `imagenes/${nombreUnico}`;

    estadio.imagen = rutaRelativa;
    await estadio.save();

    if (imagenAnterior && imagenAnterior !== rutaRelativa) {
      await borrarArchivoImagen(imagenAnterior);
    }

    return res.status(200).json({
      mensaje: '200 OK: imagen guardada',
      imagen: rutaRelativa,
      rutaCompleta: `${req.protocol}://${req.get('host')}/${rutaRelativa}`,
      estadio
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  } finally {
    if (archivo && archivo.path) {
      try {
        await fs.unlink(archivo.path);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`No se pudo eliminar el archivo temporal ${archivo.path}: ${error.message}`);
        }
      }
    }
  }
};

const obtenerImagenEstadio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del estadio' });
    }

    const estadio = await Estadio.findById(id);

    if (!estadio) {
      return res.status(400).json({ mensaje: '400 Bad Request: estadio no encontrado' });
    }

    if (!estadio.imagen) {
      return res.status(404).json({ mensaje: '404 Not Found: el estadio no tiene imagen registrada' });
    }

    const rutaAbsoluta = path.join(CARPETA_IMAGENES, path.basename(estadio.imagen));

    try {
      await fs.access(rutaAbsoluta);
    } catch {
      return res.status(404).json({
        mensaje: '404 Not Found: el archivo de imagen no existe en el servidor',
        imagen: estadio.imagen
      });
    }

    return res.status(200).json({
      mensaje: '200 OK: imagen encontrada',
      imagen: estadio.imagen,
      rutaCompleta: `${req.protocol}://${req.get('host')}/${estadio.imagen}`
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const eliminarImagenEstadio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del estadio' });
    }

    const estadio = await Estadio.findById(id);

    if (!estadio) {
      return res.status(400).json({ mensaje: '400 Bad Request: estadio no encontrado' });
    }

    if (!estadio.imagen) {
      return res.status(404).json({ mensaje: '404 Not Found: el estadio no tiene imagen registrada' });
    }

    await borrarArchivoImagen(estadio.imagen);
    estadio.imagen = undefined;
    await estadio.save();

    return res.status(200).json({ mensaje: '200 OK: imagen eliminada', estadio });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

module.exports = {
  crearEstadio,
  eliminarEstadio,
  actualizarEstadio,
  obtenerUnEstadio,
  obtenerVariosEstadios,
  subirImagenEstadio,
  obtenerImagenEstadio,
  eliminarImagenEstadio
};
