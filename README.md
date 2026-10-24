# Diario de Progreso Gamer

# RENDER
Backend: https://diario-progreso-gamer-2on6.onrender.com
Frontend: https://diario-progreso-gamer-1-gqpr.onrender.com

## 1. Descripción del proyecto

Diario de Progreso Gamer es una aplicación web diseñada para registrar videojuegos, almacenar sesiones de juego y consultar estadísticas de progreso.

La aplicación permite organizar una biblioteca personal y seguir el tiempo jugado, las sesiones y los logros de cada videojuego. La interfaz utiliza una estética gamer futurista, adaptable a escritorio y móvil.

Permite responder preguntas como:

- ¿Qué videojuegos estoy jugando actualmente?
- ¿Cuánto tiempo he dedicado a cada videojuego?
- ¿Cuál es mi porcentaje de avance más reciente?

## 2. Tecnologías utilizadas

**Backend**

- Node.js
- Express
- TypeScript
- Mongoose
- MongoDB Atlas

**Frontend**

- React
- TypeScript
- Vite
- React Router

## 3. Arquitectura del backend

El backend utiliza una arquitectura por capas:

- **Modelos:** definen las estructuras de datos y las validaciones de Mongoose.
- **Servicios:** contienen la lógica de negocio, incluyendo cálculos estadísticos y validación de referencias.
- **Controladores:** reciben las solicitudes HTTP y generan las respuestas correspondientes.
- **Rutas:** vinculan los endpoints con los controladores.
- **Middlewares:** gestionan el registro de solicitudes y el manejo centralizado de errores.

Esta separación permite mantener el código organizado y facilita su mantenimiento.

## 4. Modelos de datos

### Modelo Videojuego

Representa la información general de cada videojuego registrado.

Sus propiedades incluyen nombre, plataforma, género, estado y una colección de logros. Cada logro contiene un nombre y un indicador booleano `obtenido`.

Los logros se almacenan como subdocumentos dentro del videojuego.

**Justificación:** los logros pertenecen a un videojuego específico, constituyen una colección acotada y generalmente se consultan junto con la información de ese videojuego.

### Modelo Partida

Representa una sesión de juego.

Sus datos principales incluyen:

- `videojuego`: referencia al videojuego asociado.
- `fecha`: fecha de la sesión.
- `duracionMinutos`: duración como entero mayor o igual a 1.
- `porcentajeAvance`: avance registrado entre 0 y 100.

**Justificación:** las partidas se almacenan en una colección independiente porque su cantidad puede aumentar continuamente. Además, pueden consultarse sin necesidad de recuperar toda la información del videojuego.

La relación entre ambas colecciones es de uno a muchos: un videojuego puede tener numerosas partidas.

## 5. Cálculo del resumen de progreso

El endpoint `GET /api/videojuegos/:id/resumen` calcula las estadísticas a partir de las partidas registradas para un videojuego. Si todavía no tiene partidas, devuelve cero partidas, cero horas, `ultimaSesion: null` y `porcentajeAvance: 0`.

### Fórmulas

- **Cantidad de partidas:** número de sesiones registradas para el videojuego.
- **Minutos totales:** `Σ duracionMinutos` de todas sus partidas.
- **Horas totales:** `minutosTotales / 60`.
- **Última sesión:** fecha de la partida más reciente.
- **Porcentaje de avance actual:** porcentaje registrado en la partida más reciente. No se promedian los porcentajes porque el resumen representa el estado actual.

La partida más reciente se determina ordenando por fecha descendente y, si dos partidas tienen la misma fecha, por identificador descendente. La cifra de logros obtenidos que aparece en las tarjetas del catálogo es un conteo independiente y no se confunde con el porcentaje de avance de las partidas.

### Ejemplo

Se registran tres partidas:

| Partida | Duración    | Avance |
| ------- | ----------- | ------ |
| 1       | 60 minutos  | 20%    |
| 2       | 90 minutos  | 45%    |
| 3       | 120 minutos | 70%    |

El resumen calculado será:

- Horas totales: 4,5 horas.
- Partidas registradas: 3.
- Última partida: fecha correspondiente a la tercera sesión.
- Avance actual: 70%.

Respuesta de ejemplo:

```json
{
  "videojuegoId": "ID_DEL_VIDEOJUEGO",
  "cantidadPartidas": 3,
  "horasTotales": 4.5,
  "ultimaSesion": "2026-10-23T18:00:00.000Z",
  "porcentajeAvance": 70
}
```

## 6. Endpoints de la API

La URL base local es `http://localhost:3000`. Todas las rutas de la API aceptan y devuelven JSON, salvo las respuestas `204`, que no tienen cuerpo.

### Verificar el servidor

| Método | Ruta | Resultado                                                     |
| ------ | ---- | ------------------------------------------------------------- |
| `GET`  | `/`  | Devuelve un mensaje que confirma que la API está funcionando. |

### Videojuegos

| Método   | Ruta                              | Resultado                                                                                |
| -------- | --------------------------------- | ---------------------------------------------------------------------------------------- |
| `GET`    | `/api/videojuegos`                | Lista todos los videojuegos.                                                             |
| `GET`    | `/api/videojuegos?estado=jugando` | Filtra por estado. Valores permitidos: `jugando`, `pausado`, `completado`, `abandonado`. |
| `GET`    | `/api/videojuegos/:id`            | Devuelve un videojuego por su ID.                                                        |
| `POST`   | `/api/videojuegos`                | Crea un videojuego y devuelve el documento creado (`201`).                               |
| `PUT`    | `/api/videojuegos/:id`            | Actualiza un videojuego y devuelve el documento actualizado.                             |
| `DELETE` | `/api/videojuegos/:id`            | Elimina un videojuego (`204`, sin cuerpo).                                               |
| `GET`    | `/api/videojuegos/:id/partidas`   | Lista las partidas del videojuego, de la más reciente a la más antigua.                  |
| `GET`    | `/api/videojuegos/:id/resumen`    | Devuelve el resumen calculado de partidas del videojuego.                                |
| `PATCH`  | `/api/videojuegos/:id/logros/:logroId` | Marca un logro como obtenido o pendiente. El cuerpo acepta `{ "obtenido": true }` o `{ "obtenido": false }`. |

Ejemplo de cuerpo para crear un videojuego:

```json
{
  "nombre": "Hades",
  "plataforma": "PC",
  "genero": "accion",
  "estado": "jugando",
  "logros": [
    {
      "nombre": "Primer escape",
      "obtenido": false
    }
  ]
}
```

`nombre`, `plataforma` y `genero` son obligatorios. Las plataformas permitidas son `PC`, `PlayStation`, `Xbox`, `Switch` y `Movil`; los géneros permitidos son `accion`, `rol`, `estrategia`, `puzzle`, `deportes` y `otro`. Los estados permitidos son `jugando`, `pausado`, `completado` y `abandonado`. El estado predeterminado es `jugando` y los logros son una lista vacía si no se especifican.

### Partidas

| Método   | Ruta                | Resultado                                                               |
| -------- | ------------------- | ----------------------------------------------------------------------- |
| `GET`    | `/api/partidas`     | Lista todas las partidas, incluyendo los datos del videojuego asociado. |
| `POST`   | `/api/partidas`     | Registra una partida y devuelve el documento creado (`201`).            |
| `DELETE` | `/api/partidas/:id` | Elimina una partida (`204`, sin cuerpo).                                |

Ejemplo de cuerpo para registrar una partida:

```json
{
  "videojuego": "ID_DEL_VIDEOJUEGO",
  "fecha": "2026-10-23",
  "duracionMinutos": 90,
  "porcentajeAvance": 45
}
```

Todos los campos son obligatorios y no se aceptan campos adicionales. `videojuego` debe ser el ID de un videojuego existente, `fecha` debe ser una fecha real con formato `YYYY-MM-DD`, `duracionMinutos` debe ser un entero mayor o igual a `1` y `porcentajeAvance` debe ser un número entre `0` y `100`.

### Errores comunes

- `400 Bad Request`: ID con formato inválido, filtro `estado` no permitido o datos que no cumplen las validaciones del modelo.
- `404 Not Found`: no existe el videojuego o la partida solicitada.
- `409 Conflict`: no se puede eliminar un videojuego que todavía tiene partidas asociadas.
- `500 Internal Server Error`: error inesperado del servidor.

## Middlewares del backend

La API utiliza middlewares para identificar y registrar las solicitudes, y para centralizar los errores:

### requestId

Genera un identificador UUID para cada solicitud HTTP, lo incorpora a la cabecera `X-Request-ID` y lo incluye en las respuestas.

Este identificador permite relacionar las respuestas del cliente con los registros del servidor.

### logger

Registra en la consola:

- Fecha y hora de la solicitud.
- Identificador de la solicitud.
- Método HTTP.
- Ruta consultada.
- Código de respuesta HTTP.
- Tiempo de procesamiento en milisegundos.

### errorHandler

Centraliza el manejo de errores de la aplicación.

| Código | Significado                                      |
| ------ | ------------------------------------------------ |
| 400    | Datos o identificadores inválidos                |
| 404    | Recurso o ruta inexistente                       |
| 409    | Conflicto por partidas asociadas a un videojuego |
| 500    | Error interno del servidor                       |

Las respuestas de error contienen el identificador de la solicitud para facilitar el diagnóstico.

## 7. Instalación y ejecución local

Se necesitan Node.js, npm y una instancia accesible de MongoDB.

### Backend

```bash
cd backend
npm install
```

Crear un archivo `.env` con las variables necesarias:

```env
PORT=3000
MONGODB_URI=TU_CADENA_DE_CONEXION
FRONTEND_URL=http://localhost:5173
```

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

El backend queda disponible en `http://localhost:3000`.

### Frontend

En otra terminal, instalar las dependencias:

```bash
cd frontend
npm install
```

Crear `frontend/.env` con la URL base de la API:

```env
VITE_API_URL=http://localhost:3000/api
```

Iniciar Vite desde `frontend/`:

```bash
npm run dev
```

Abrir en el navegador la dirección local que indique Vite (normalmente `http://localhost:5173`). Para cargar datos, el backend y MongoDB deben estar disponibles.

También se puede copiar `frontend/.env.example` a `frontend/.env` y ajustar `VITE_API_URL` si el backend utiliza otra dirección. El backend permite el origen local `http://localhost:5173` y el origen configurado en `FRONTEND_URL`.

### Funcionalidades actuales del frontend

- La página inicial muestra el catálogo y permite filtrarlo por estado. Las tarjetas muestran estado, nombre, plataforma, género, logros obtenidos y su barra de progreso. Sus portadas usan iconos SVG y composiciones abstractas locales, con acentos visuales según género y estado; no dependen de imágenes externas.
- Se pueden crear y editar videojuegos, incluidos sus logros.
- El detalle de cada videojuego muestra las estadísticas del backend, el historial de partidas y los logros; permite cambiar el estado de los logros y abrir el formulario de registro.
- El formulario de partidas permite seleccionar un videojuego, una fecha (por defecto, la fecha local actual), la duración en minutos y el porcentaje de avance. Valida que la duración sea un entero mayor que cero y que el avance esté entre 0 y 100. Al guardar, vuelve al detalle del videojuego.
- Desde el detalle, el formulario de partidas puede abrirse con el videojuego ya seleccionado mediante `?videojuego=ID`.
- El historial general de partidas permite buscar por nombre de videojuego y eliminar sesiones con confirmación.
- Las páginas conservan estados de carga, error y contenido vacío; el diseño se adapta a pantallas de escritorio y móvil.

### Rutas principales del frontend

| Ruta | Pantalla |
|---|---|
| `/` | Catálogo filtrable de videojuegos. |
| `/videojuegos/nuevo` | Formulario para crear un videojuego. |
| `/videojuegos/:id` | Detalle, resumen, logros e historial de partidas. |
| `/videojuegos/:id/editar` | Formulario para editar un videojuego. |
| `/partidas/nueva` | Formulario para registrar una partida. |
| `/partidas` | Historial de sesiones con búsqueda y eliminación. |

## 8. Despliegue

El despliegue de producción está pendiente. Antes de publicar, configura `MONGODB_URI`, `PORT`, `FRONTEND_URL`, `VITE_API_URL` y los dominios correspondientes al entorno.

## 9. Verificación

Desde la carpeta `frontend/`:

```bash
npm run build
npm run lint
```

Desde `backend/`, compilar TypeScript:

```bash
npm run build
```

## 10. Estado del proyecto

**En desarrollo.** La aplicación permite gestionar videojuegos, logros y partidas, consultar el historial y visualizar estadísticas calculadas por el backend. La publicación en un entorno de producción sigue pendiente.

Las funciones disponibles y los pasos de configuración se documentan en este archivo conforme evoluciona el proyecto.
