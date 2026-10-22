const Producto = require('../modelo/producto');
const Almacen = require('../modelo/almacen');
const path = require('path');
const fs = require('fs').promises;

const CARPETA_IMAGENES = path.join(__dirname, '..', 'imagenes');

const crearProducto = async (req, res) => {
  console.log('Datos recibidos para crear producto:', req.body);
  try {
    const { nombre, categoria, ubicacion, precio, almacen } = req.body;

    if (!nombre || !categoria || !ubicacion || precio === undefined || precio === null || !almacen) {
      return res.status(400).json({ mensaje: '400 Bad Request: faltan campos requeridos' });
    }

    const existeAlmacen = await Almacen.findById(almacen);

    if (!existeAlmacen) {
      return res.status(400).json({ mensaje: '400 Bad Request: almacen no encontrado' });
    }

    const producto = new Producto({ nombre, categoria, ubicacion, precio, almacen });
    await producto.save();
    await producto.populate('almacen');

    return res.status(200).json({ mensaje: '200 OK: producto creado', producto });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: '400 Bad Request: datos invalidos', error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del producto' });
    }

    const producto = await Producto.findByIdAndDelete(id);

    if (!producto) {
      return res.status(400).json({ mensaje: '400 Bad Request: producto no encontrado' });
    }

    return res.status(200).json({ mensaje: '200 OK: producto eliminado', producto });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, ubicacion, precio, almacen } = req.body;
    console.log('Datos recibidos para actualizar producto:', req.body);

    if (!nombre || !categoria || !ubicacion || precio === undefined || precio === null || !almacen) {
      return res.status(400).json({ mensaje: '400 Bad Request: faltan campos requeridos' });
    }

    const existeAlmacen = await Almacen.findById(almacen);

    if (!existeAlmacen) {
      return res.status(400).json({ mensaje: '400 Bad Request: almacen no encontrado' });
    }

    const producto = await Producto.findByIdAndUpdate(
      id,
      { nombre, categoria, ubicacion, precio, almacen },
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(400).json({ mensaje: '400 Bad Request: producto no encontrado' });
    }

    await producto.populate('almacen');

    return res.status(200).json({ mensaje: '200 OK: producto actualizado', producto });
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

const obtenerUnProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del producto' });
    }

    const producto = await Producto.findById(id).populate('almacen');

    if (!producto) {
      return res.status(400).json({ mensaje: '400 Bad Request: producto no encontrado' });
    }

    return res.status(200).json({ mensaje: '200 OK: producto encontrado', producto });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const obtenerVariosProductos = async (req, res) => {
  try {
    const { almacen } = req.query;
    const filtro = almacen ? { almacen } : {};

    const productos = await Producto.find(filtro).populate('almacen');

    return res.status(200).json({ mensaje: '200 OK: lista de productos', productos });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const subirImagenProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del producto' });
    }

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(400).json({ mensaje: '400 Bad Request: producto no encontrado' });
    }

    if (!req.files || !req.files.imagen) {
      return res.status(400).json({ mensaje: '400 Bad Request: no se envio ningun archivo, use el campo "imagen"' });
    }

    const archivo = req.files.imagen;
    const extension = path.extname(archivo.name).toLowerCase();
    const nombreUnico = `${id}_${Date.now()}${extension}`;
    const rutaDestino = path.join(CARPETA_IMAGENES, nombreUnico);

    await fs.copyFile(archivo.path, rutaDestino);

    const rutaRelativa = `imagenes/${nombreUnico}`;
    producto.imagen = rutaRelativa;
    await producto.save();

    return res.status(200).json({
      mensaje: '200 OK: imagen guardada',
      imagen: rutaRelativa,
      rutaCompleta: `${req.protocol}://${req.get('host')}/${rutaRelativa}`,
      producto
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const obtenerImagenProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del producto' });
    }

    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(400).json({ mensaje: '400 Bad Request: producto no encontrado' });
    }

    if (!producto.imagen) {
      return res.status(404).json({ mensaje: '404 Not Found: el producto no tiene imagen registrada' });
    }

    const rutaAbsoluta = path.join(CARPETA_IMAGENES, path.basename(producto.imagen));

    try {
      await fs.access(rutaAbsoluta);
    } catch {
      return res.status(404).json({ mensaje: '404 Not Found: el archivo de imagen no existe en el servidor', imagen: producto.imagen });
    }

    return res.status(200).json({
      mensaje: '200 OK: imagen encontrada',
      imagen: producto.imagen,
      rutaCompleta: `${req.protocol}://${req.get('host')}/${producto.imagen}`
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

module.exports = {
  crearProducto,
  eliminarProducto,
  actualizarProducto,
  obtenerUnProducto,
  obtenerVariosProductos,
  subirImagenProducto,
  obtenerImagenProducto
};
