# Producto Trust

API REST para la gestión de **productos** y **almacenes**, con subida/consulta de imágenes y geolocalización. Construida con **Express 5**, **MongoDB Atlas/Local (Mongoose)** y **Node.js**.

---

## Requisitos

- Node.js 18+ (usa `fetch` nativo y `AbortSignal.timeout`)
- MongoDB Atlas o una instancia local de MongoDB

## Instalación

```bash
npm install
```

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=9000
DB_NAME=nombre_de_tu_base
MONGODB_URI=mongodb+srv://usuario:clave@cluster/...
```

La conexión intenta primero **MongoDB Atlas** (`MONGODB_URI`); si no está disponible, cae automáticamente a la base **local** (`mongodb://localhost:27017/<DB_NAME>`).

## Ejecución

```bash
npm start
```

El servidor queda disponible en `http://localhost:<PORT>`.

## Estructura del proyecto

```
├── app.js                      # Punto de entrada: middleware, rutas y arranque
├── config/
│   └── db.js                   # Conexión a MongoDB (Atlas con fallback local)
├── routers/
│   └── rutas.js                # Definición de routers (productos, almacen, ubicacion)
├── control/
│   ├── productoControl.js      # Lógica CRUD + subida/consulta de imágenes
│   ├── almacenControl.js       # Lógica CRUD de almacenes (borrado en cascada)
│   └── ubicacionControl.js     # Controlador de geolocalización
├── services/
│   └── ubicacionService.js     # Cliente de Nominatim (OpenStreetMap)
├── modelo/
│   ├── producto.js             # Esquema de Producto (Mongoose)
│   └── almacen.js              # Esquema de Almacen con virtual "productos"
└── imagenes/                   # Archivos estáticos de imágenes subidas
```

## Modelos

### Producto

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| nombre | String | sí |
| categoria | String | sí |
| ubicacion | String | sí |
| precio | Number | sí |
| almacen | ObjectId → Almacen | sí |
| imagen | String (ruta relativa) | no |
| fechaCreacion | Date | default: ahora |

### Almacen

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| nombre | String | sí |
| ubicacion | String | sí |
| fechaCreacion | Date | default: ahora |

Incluye un **virtual** `productos` que permite hacer `populate('productos')` para listar los productos de cada almacén.

## Endpoints

### Raíz

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Saludo / health check |

### Productos (`/productos`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/productos/alta` | Crear producto |
| DELETE | `/productos/baja/:id` | Eliminar producto |
| DELETE | `/productos/eliminar/:id` | Eliminar producto |
| PUT | `/productos/actualizar/:id` | Actualizar producto |
| GET | `/productos/obtenerUno/:id` | Obtener un producto (con populate de almacén) |
| GET | `/productos/obtenerVarios` | Listar productos (filtro opcional `?almacen=<id>`) |
| POST | `/productos/subirImagen/:id` | Subir imagen (multipart, campo `imagen`) |
| GET | `/productos/obtenerImagen/:id` | Obtener datos/URL de la imagen del producto |

### Almacenes (`/almacen`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/almacen/alta` | Crear almacén |
| DELETE | `/almacen/baja/:id` | Eliminar almacén y sus productos (en cascada) |
| DELETE | `/almacen/eliminar/:id` | Eliminar almacén y sus productos |
| PUT | `/almacen/actualizar/:id` | Actualizar almacén |
| GET | `/almacen/obtenerUno/:id` | Obtener un almacén (con populate de productos) |
| GET | `/almacen/obtenerVarios` | Listar almacenes (con populate de productos) |

### Ubicación (`/ubicacion`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/ubicacion/donde-estoy?lat=<lat>&lon=<lon>` | Devuelve la ciudad (Nominatim / OpenStreetMap) a partir de coordenadas |

## Archivos estáticos

Las imágenes subidas se sirven desde la raíz con el prefijo `/imagenes`:

```
http://localhost:9000/imagenes/<nombre_archivo>.png
```

## Lógica de imágenes

- **Subida**: `connect-multiparty` deja el archivo temporal en `req.files.imagen`; el controlador lo copia a `imagenes/` con nombre único `` `${id}_${Date.now()}${extension}` `` y guarda la ruta relativa en `producto.imagen`.
- **Consulta**: `GET /productos/obtenerImagen/:id` responde un JSON con la ruta y la URL completa. Los **bytes** los sirve `express.static` desde la ruta `/imagenes`.
- **Path traversal**: al consultar la imagen se usa `path.basename()` para evitar que rutas manipuladas en la BD escapen de la carpeta `imagenes/`.

## API externa

- **[Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org/)** para geocodificación inversa. Envía `User-Agent: ProductoTrust/1.0` y un timeout de 4 s.

## Licencia

ISC
