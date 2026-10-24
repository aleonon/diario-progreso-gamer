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

El backend calcula las estadísticas de progreso a partir de las partidas registradas para cada videojuego.

### Horas totales jugadas

Si las duraciones se almacenan en minutos:

Horas totales = Suma de las duraciones / 60

### Cantidad de partidas

Corresponde al número total de sesiones registradas para un videojuego.

### Fecha de la última partida

Se obtiene identificando la partida con la fecha más reciente.

### Porcentaje de avance actual

Corresponde al porcentaje de avance registrado en la partida más reciente.

No se utiliza el promedio de los porcentajes, porque el objetivo es representar el estado actual del videojuego.

### Ejemplo

Se registran tres partidas:

| Partida | Duración | Avance |
|---|---|---|
| 1 | 60 minutos | 20% |
| 2 | 90 minutos | 45% |
| 3 | 120 minutos | 70% |

El resumen calculado será:

- Horas totales: 4,5 horas.
- Partidas registradas: 3.
- Última partida: fecha correspondiente a la tercera sesión.
- Avance actual: 70%.

La lógica de cálculo se implementará en la capa de servicios del backend.

## 6. Instalación y ejecución local

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

*Pendiente de implementar.*

## 7. Endpoints de la API

*Esta sección se completará conforme se implementen y prueben las rutas.*

## 8. Despliegue

- Backend: pendiente.
- Frontend: pendiente.

## 9. Estado del proyecto

**En desarrollo.**

Las funcionalidades y secciones pendientes se actualizarán conforme avance la implementación.
