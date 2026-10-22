const Almacen = require('../modelo/almacen');
const Producto = require('../modelo/producto');

const crearAlmacen = async (req, res) => {
  console.log('Datos recibidos para crear almacen:', req.body);
  try {
    const { nombre, ubicacion } = req.body;

    if (!nombre || !ubicacion) {
      return res.status(400).json({ mensaje: '400 Bad Request: faltan campos requeridos' });
    }

    const almacen = new Almacen({ nombre, ubicacion });
    await almacen.save();

    return res.status(200).json({ mensaje: '200 OK: almacen creado', almacen });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensaje: '400 Bad Request: datos invalidos', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const eliminarAlmacen = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del almacen' });
    }

    const almacen = await Almacen.findByIdAndDelete(id);

    if (!almacen) {
      return res.status(400).json({ mensaje: '400 Bad Request: almacen no encontrado' });
    }

    const { deletedCount } = await Producto.deleteMany({ almacen: id });

    return res.status(200).json({
      mensaje: `200 OK: almacen eliminado junto con ${deletedCount} producto(s)`,
      almacen
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const actualizarAlmacen = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ubicacion } = req.body;
    console.log('Datos recibidos para actualizar almacen:', req.body);

    if (!nombre || !ubicacion) {
      return res.status(400).json({ mensaje: '400 Bad Request: faltan campos requeridos' });
    }

    const almacen = await Almacen.findByIdAndUpdate(
      id,
      { nombre, ubicacion },
      { new: true, runValidators: true }
    );

    if (!almacen) {
      return res.status(400).json({ mensaje: '400 Bad Request: almacen no encontrado' });
    }

    return res.status(200).json({ mensaje: '200 OK: almacen actualizado', almacen });
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

const obtenerUnAlmacen = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ mensaje: '400 Bad Request: falta el id del almacen' });
    }

    const almacen = await Almacen.findById(id).populate('productos');

    if (!almacen) {
      return res.status(400).json({ mensaje: '400 Bad Request: almacen no encontrado' });
    }

    return res.status(200).json({ mensaje: '200 OK: almacen encontrado', almacen });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ mensaje: '400 Bad Request: id invalido', error: error.message });
    }
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

const obtenerVariosAlmacenes = async (req, res) => {
  try {
    const almacenes = await Almacen.find().populate('productos');

    return res.status(200).json({ mensaje: '200 OK: lista de almacenes', almacenes });
  } catch (error) {
    return res.status(500).json({ mensaje: '500 Internal Server Error', error: error.message });
  }
};

module.exports = {
  crearAlmacen,
  eliminarAlmacen,
  actualizarAlmacen,
  obtenerUnAlmacen,
  obtenerVariosAlmacenes
};
