const CONFIG = {
  url: 'https://nominatim.openstreetmap.org/reverse',
  formato: 'jsonv2',
  idioma: 'es',
  timeout: 4000,
  userAgent: 'SistemaEstadios/1.0'
};

const obtenerCiudad = async (lat, lon) => {
  const url = `${CONFIG.url}?lat=${lat}&lon=${lon}&format=${CONFIG.formato}&accept-language=${CONFIG.idioma}`;

  const respuesta = await fetch(url, {
    headers: { 'User-Agent': CONFIG.userAgent },
    signal: AbortSignal.timeout(CONFIG.timeout)
  });

  if (!respuesta.ok) {
    throw new Error(`Nominatim respondio con codigo ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  if (datos.error) {
    throw new Error(`Nominatim no pudo resolver la ubicacion: ${datos.error}`);
  }

  const direccion = datos.address || {};

  return direccion.city || direccion.town || direccion.village || direccion.municipality || null;
};

module.exports = { obtenerCiudad };
