# Diario de Progreso Gamer

## 1. Descripción del proyecto

Diario de Progreso Gamer es una aplicación web diseñada para registrar videojuegos, almacenar sesiones de juego y consultar estadísticas de progreso.

La aplicación busca responder tres preguntas principales:

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

Entre sus propiedades se encuentran el título, la plataforma, el estado del videojuego y una colección de logros.

Los logros se almacenan como subdocumentos dentro del videojuego.

**Justificación:** los logros pertenecen a un videojuego específico, constituyen una colección acotada y generalmente se consultan junto con la información de ese videojuego.

### Modelo Partida

Representa una sesión de juego.

Sus datos principales incluyen:

- Referencia al videojuego.
- Fecha de la partida.
- Duración de la sesión.
- Porcentaje de avance alcanzado.

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

La partida más reciente se determina ordenando por fecha descendente y, si dos partidas tienen la misma fecha, por identificador descendente.

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

`nombre`, `plataforma` y `genero` son obligatorios. Las plataformas permitidas son `PC`, `PlayStation`, `Xbox`, `Switch` y `Movil`; los géneros permitidos son `accion`, `rol`, `estrategia`, `puzzle`, `deportes` y `otro`. El estado predeterminado es `jugando` y los logros son una lista vacía si no se especifican.

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
  "fecha": "2026-10-23T18:00:00.000Z",
  "duracionMinutos": 90,
  "porcentajeAvance": 45
}
```

Todos los campos son obligatorios. `videojuego` debe ser el ID de un videojuego existente, `duracionMinutos` debe ser al menos `1` y `porcentajeAvance` debe estar entre `0` y `100`.

### Errores comunes

- `400 Bad Request`: ID con formato inválido, filtro `estado` no permitido o datos que no cumplen las validaciones del modelo.
- `404 Not Found`: no existe el videojuego o la partida solicitada.
- `500 Internal Server Error`: error inesperado del servidor.

## Middlewares del backend

La API utiliza tres middlewares principales:

### requestId

Genera un identificador UUID para cada solicitud HTTP y lo incorpora a la cabecera `X-Request-ID`.

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

### Backend

```bash
cd backend
npm install
```

Crear un archivo `.env` con las variables necesarias:

```env
PORT=3000
MONGODB_URI=TU_CADENA_DE_CONEXION
```

Iniciar el servidor:

```bash
npm run dev
```

### Frontend

_Pendiente de implementar._

## 8. Despliegue

- Backend: pendiente.
- Frontend: pendiente.

## 9. Estado del proyecto

**En desarrollo.**

Las funcionalidades y secciones pendientes se actualizarán conforme avance la implementación.
