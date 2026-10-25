# Sistema de Gestion de Estadios de Futbol

API REST para la gestion de **estadios de futbol**, con operaciones CRUD, subida y consulta de fotografias, y geolocalizacion inversa. Construida con **Node.js**, **Express 5** y **MongoDB (Mongoose)**.

Autor: **Tu Nombre**

---

## Requisitos

- Node.js 18 o superior
- MongoDB Atlas o una instancia local de MongoDB

## Instalacion

```bash
npm install
```

Crea el archivo `.env` en la raiz del proyecto tomando como base `.env.example`:

```env
PORT=8080
DB_NAME=estadios
MONGODB_URI=mongodb+srv://usuario:clave@cluster0.xxxxx.mongodb.net/estadios
```

La conexion intenta primero **MongoDB Atlas** (`MONGODB_URI`). Si Atlas no responde, cae automaticamente a la base local `mongodb://localhost:27017/<DB_NAME>`.

## Ejecucion

```bash
npm start
```

Servidor disponible en `http://localhost:<PORT>`.

## Estructura del proyecto

```
├── app.js                       # Punto de entrada: middlewares, rutas y arranque
├── config/
│   ├── db.js                    # Conexion a MongoDB (Atlas con fallback local)
│   └── imagenes.js              # Ruta, extensiones y tamano maximo de imagenes
├── routers/
│   └── rutas.js                 # Routers de estadios y ubicacion
├── control/
│   ├── estadioControl.js        # CRUD + imagenes de estadios
│   └── ubicacionControl.js      # Geolocalizacion inversa
├── services/
│   └── ubicacionService.js      # Cliente de Nominatim (OpenStreetMap)
├── modelo/
│   └── estadio.js               # Esquema de Estadio (Mongoose)
└── imagenes/                    # Fotografias subidas (express.static)
```

## Modelo Estadio

| Campo | Tipo | Obligatorio | Descripcion |
|-------|------|-------------|-------------|
| nombre | String | si | Nombre del estadio |
| capacidad | Number | si | Capacidad de espectadores (>= 0) |
| ubicacion | String | si | Ciudad o direccion |
| equipoLocal | String | si | Equipo que juega de local |
| imagen | String | no | Ruta relativa de la fotografia |
| fechaCreacion | Date | no | Se asigna automaticamente |

## Endpoints

Base de estadios: `/api/estadios`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Health check de la API |
| POST | `/api/estadios/alta` | Crear estadio |
| GET | `/api/estadios/obtenerVarios` | Listar estadios (filtros opcionales `?equipoLocal=` y `?ubicacion=`) |
| GET | `/api/estadios/obtenerUno/:id` | Obtener un estadio |
| PUT | `/api/estadios/actualizar/:id` | Actualizar estadio |
| DELETE | `/api/estadios/baja/:id` | Eliminar estadio y su imagen |
| DELETE | `/api/estadios/eliminar/:id` | Igual que `baja/:id` |
| POST | `/api/estadios/subirImagen/:id` | Subir fotografia (multipart, campo `imagen`) |
| GET | `/api/estadios/obtenerImagen/:id` | Consultar ruta y URL de la fotografia |
| DELETE | `/api/estadios/eliminarImagen/:id` | Eliminar solo la fotografia |

### Ubicacion

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/ubicacion/donde-estoy?lat=<lat>&lon=<lon>` | Devuelve la ciudad segun coordenadas |

## Ejemplo de creacion

```bash
curl -X POST http://localhost:8080/api/estadios/alta ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Estadio Azteca\",\"capacidad\":87000,\"ubicacion\":\"Ciudad de Mexico\",\"equipoLocal\":\"Club America\"}"
```

## Ejemplo de subida de imagen

```bash
curl -X POST http://localhost:8080/api/estadios/subirImagen/<ID> ^
  -F "imagen=@C:\ruta\azteca.jpg"
```

Formatos permitidos: `.jpg`, `.jpeg`, `.png`, `.webp`. Tamano maximo: 5 MB.

La fotografia se guarda en `imagenes/` con el nombre `<id>_<timestamp><extension>` y se sirve en:

```
http://localhost:8080/imagenes/<nombre_archivo>.jpg
```

## Logica de imagenes

- `connect-multiparty` deja el archivo temporal en `req.files.imagen`.
- Se validan extension y tamano antes de guardar.
- Se copia a `imagenes/` con un nombre unico y se guarda la ruta relativa en el estadio.
- Al reemplazar una imagen, se elimina la anterior del disco.
- Al eliminar un estadio, se elimina su imagen.
- El archivo temporal siempre se borra al finalizar la peticion.
- Se usa `path.basename()` al leer la ruta para evitar path traversal.

## API externa

- [Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org/) para geocodificacion inversa, con `User-Agent: SistemaEstadios/1.0` y timeout de 4 segundos.

## Licencia

MIT
