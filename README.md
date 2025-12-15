# 🏆 Liga EDUmind - Manual de Usuario y Guía de Inicio

¡Bienvenido a **Liga EDUmind**!

Esta aplicación es una herramienta digital diseñada para profesores de Educación Física que quieren gestionar ligas deportivas escolares con un enfoque especial: **los valores importan tanto como los goles**.

A diferencia de una liga normal, aquí utilizamos el modelo **MRPS** (Modelo de Responsabilidad Personal y Social), donde los equipos suman puntos no solo por ganar partidos, sino por su comportamiento, respeto y juego limpio.

---

## 📘 ¿Qué es esta aplicación?

Imagina que es una libreta digital inteligente que te ayuda a:
1.  **Organizar tus clases**: Crear ligas para tus grupos (ej. "3º ESO A - Fútbol Sala").
2.  **Gestionar equipos**: Registrar a tus alumnos y asignarlos a equipos.
3.  **Crear calendarios**: Generar automáticamente todos los partidos de la temporada ("todos contra todos").
4.  **Arbitrar partidos**: Usar un marcador digital en clase que permite sumar goles y evaluar el comportamiento en tiempo real.
5.  **Ver clasificaciones**: La tabla se actualiza sola, sumando los "Puntos de Juego" y los "Puntos de Valores".

---

## 🧩 Partes de la Aplicación (Glosario Sencillo)

Para que te muevas con soltura, aquí explicamos las secciones principales:

### 1. El Panel de Control (Dashboard)
Es tu pantalla de inicio. Aquí verás todas tus ligas activas de un vistazo.
-   **Botón "Crear nueva liga"**: El punto de partida para empezar una nueva competición.
-   **Tarjetas de Liga**: Cada recuadro representa una clase o torneo. Pincha en "Ver Liga" para entrar a gestionarla.

### 2. Gestión de Liga
Una vez dentro de una liga, tienes varias pestañas:
-   **Clasificación**: La tabla de posiciones. ¡Ojo! Aquí verás columnas especiales de "Juego Limpio".
-   **Equipos**: Donde das de alta a los grupos de alumnos. Puedes ponerles nombre, escudo y color.
-   **Jornadas**: El calendario. Aquí ves qué partidos tocan hoy.
-   **Partidos**: El listado completo de encuentros.

### 3. El Marcador Digital (Scoreboard)
Esta es la "joya de la corona" para usar en clase con una tablet o portátil.
-   **Modo Árbitro**: Te permite sumar goles y, lo más importante, dar puntos positivos (👍) o negativos (👎) según el comportamiento (respeto al árbitro, ayuda al compañero, etc.).
-   **Sonidos**: ¡El marcador pita y celebra los goles!

---

## 🚀 Guía de Puesta en Marcha (Paso a Paso)

Si te han pasado este código y necesitas "arrancar" la aplicación en tu ordenador, no te preocupes. No necesitas ser programador, solo seguir estos pasos como si fuera una receta de cocina.

La aplicación tiene dos partes que deben funcionar a la vez:
1.  **El Cerebro (Backend)**: Guarda los datos y hace los cálculos.
2.  **La Cara (Frontend)**: Lo que tú ves y tocas en la pantalla.

### Requisitos Previos
Necesitas tener instalado en tu ordenador:
-   Una terminal (la pantalla negra de comandos).
-   **Python** (para el cerebro).
-   **Node.js** (para la cara).

### Paso 1: Encender el Cerebro (Backend)

1.  Abre una terminal.
2.  Navega hasta la carpeta del proyecto.
3.  Entra en la carpeta del cerebro:
    ```bash
    cd backend
    ```
4.  Activa el entorno virtual (es como ponerle las pilas):
    ```bash
    source venv/bin/activate
    ```
    *(Si estás en Windows, el comando es `.\venv\Scripts\activate`)*
5.  Arranca el servidor (asegúrate de usar el puerto 8001):
    ```bash
    UPLOAD_DIR=static/uploads ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
    ```
    ✅ **Señal de éxito**: Verás mensajes diciendo "Application startup complete". ¡Déjalo abierto!

### Paso 2: Encender la Cara (Frontend)

1.  Abre **otra** terminal nueva (no cierres la anterior).
2.  Ve a la carpeta del proyecto.
3.  Entra en la carpeta de la cara:
    ```bash
    cd frontend
    ```
4.  Arranca la interfaz visual:
    ```bash
    npm run dev
    ```
    ✅ **Señal de éxito**: Verás un enlace que dice `Local: http://localhost:5173/`.

### Paso 3: ¡A jugar!

1.  Abre tu navegador de internet (Chrome, Firefox, etc.).
2.  Escribe en la barra de arriba: `http://localhost:5173`
3.  ¡Listo! Deberías ver la pantalla de inicio de sesión.

---

## 🆘 Solución de Problemas Comunes

**"No me deja registrarme"**
-   Asegúrate de que la terminal del "Paso 1 (Backend)" sigue abierta y no tiene errores rojos.
-   Comprueba que estás usando el puerto **8001** como indicamos arriba.

**"La pantalla se queda en blanco"**
-   Asegúrate de que la terminal del "Paso 2 (Frontend)" sigue abierta.
-   Prueba a recargar la página con `Ctrl + R` (o `Cmd + R` en Mac).

**"No se guardan las fotos de los equipos"**
-   El sistema necesita una carpeta para guardarlas. El comando del Paso 1 ya se encarga de configurarlo correctamente.

---

*Desarrollado con ❤️ para la comunidad educativa.*
