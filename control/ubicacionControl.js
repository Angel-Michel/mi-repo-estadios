const { obtenerCiudad } = require('../services/ubicacionService');

const obtenerDondeEstoy = async (req, res) => {
  const latNum = Number(req.query.lat);
  const lonNum = Number(req.query.lon);
console.log('latNum:', latNum, 'lonNum:', lonNum);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return res.status(400).json({ mensaje: '400 Bad Request: faltan o son invalidos lat y lon' });
  }

  try {
    const ciudad = await obtenerCiudad(latNum, lonNum);
    return res.status(200).json({ mensaje: '200 OK', ciudad });
  } catch (error) {
    return res.status(500).json({
      mensaje: '500 Internal Server Error: servicio de ubicacion no disponible',
      error: error.message
    });
  }
};

module.exports = { obtenerDondeEstoy };
