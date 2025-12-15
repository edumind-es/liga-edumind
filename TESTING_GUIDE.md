# 🧪 Guía de Pruebas (QA) - Liga EDUmind

**Versión del Documento:** 1.0
**Fecha:** 28 de Noviembre de 2025

Esta guía está diseñada para el equipo de QA y testers con el objetivo de validar la estabilidad, funcionalidad y consistencia visual de la aplicación **Liga EDUmind**.

---

## 1. Preparación del Entorno

Antes de comenzar, asegúrate de que la aplicación se está ejecutando correctamente en tu entorno local.

1.  **Backend:** Debe estar corriendo en el puerto `8001`.
    *   Verificar: `curl http://localhost:8001/api/health` -> Debería responder `{"status":"ok"}`.
2.  **Frontend:** Debe estar corriendo en el puerto `5173`.
    *   Acceder: `http://localhost:5173`.

---

## 2. Flujos de Usuario Críticos (Functional Testing)

### A. Registro y Autenticación
*   **Prueba A1: Registro Exitoso**
    1.  Ir a `/register`.
    2.  Crear un usuario nuevo (ej. `tester_01`).
    3.  **Resultado Esperado:** Redirección automática al `/dashboard`.
*   **Prueba A2: Manejo de Errores de Registro**
    1.  Intentar registrar el mismo usuario `tester_01` nuevamente.
    2.  **Resultado Esperado:** Mensaje de error en rojo: "Código ya registrado" (NO debe haber pantalla blanca).
*   **Prueba A3: Login**
    1.  Cerrar sesión e iniciar con `tester_01`.
    2.  **Resultado Esperado:** Acceso al Dashboard con el saludo "Hola, tester_01".

### B. Gestión de Ligas
*   **Prueba B1: Crear Liga**
    1.  En Dashboard, clic en "Nueva Liga".
    2.  Rellenar nombre (ej. "Liga Test 2025") y tipo de deporte.
    3.  **Resultado Esperado:** La liga aparece en el Dashboard con la etiqueta "Activa".
*   **Prueba B2: Ver Detalles**
    1.  Clic en la tarjeta de la liga creada.
    2.  **Resultado Esperado:** Vista de detalle con tarjetas grandes para Equipos, Jornadas y Partidos.

### C. Gestión de Equipos y Calendario
*   **Prueba C1: Añadir Equipos**
    1.  Entrar en "Gestionar Equipos".
    2.  Añadir al menos 4 equipos de prueba.
    3.  **Resultado Esperado:** Los equipos se listan correctamente.
*   **Prueba C2: Generar Calendario**
    1.  Ir a "Jornadas" o "Calendario".
    2.  Clic en "Generar Calendario Automático".
    3.  **Resultado Esperado:** Notificación "Calendario generado correctamente" y aparición de las jornadas.

---

## 3. Verificación Visual (UI/UX)

El sistema ha recibido una actualización de diseño ("Liga Valores"). Verificar los siguientes puntos estéticos:

*   **Glassmorphism:** Los contenedores principales (`lme-shell`) y tarjetas (`lme-card`) deben tener un fondo blanco semitransparente y bordes sutiles.
*   **Tipografía:** Toda la aplicación debe usar la fuente **Poppins**.
*   **Consistencia:**
    *   El **Dashboard** debe mostrar las ligas en una cuadrícula ordenada.
    *   La página **Ver Liga** debe tener 3 tarjetas grandes (Equipos, Jornadas, Partidos) con iconos grandes de fondo.
    *   Los botones de acción deben tener gradientes o estilos "outline" limpios (no botones grises estándar del navegador).

---

## 4. Pruebas de Robustez (Error Handling)

*   **Prueba D1: Navegación a Liga Inexistente**
    1.  Intentar ir a `http://localhost:5173/ligas/99999`.
    2.  **Resultado Esperado:** Mensaje amigable "Liga no encontrada" o "Error al cargar la liga" dentro del diseño de la app (NO error 404 crudo del navegador ni pantalla blanca).
*   **Prueba D2: Fallo de Red (Simulado)**
    1.  (Opcional) Detener el backend (`Ctrl+C` en la terminal del backend).
    2.  Navegar por la app.
    3.  **Resultado Esperado:** Mensajes de error controlados en las zonas de carga de datos.

---

## 5. Reporte de Bugs

Si encuentras un fallo, por favor repórtalo indicando:
1.  **Pasos para reproducir:** Qué hiciste exactamente.
2.  **Comportamiento observado:** Qué pasó (pantalla blanca, mensaje de error, nada).
3.  **Comportamiento esperado:** Qué debería haber pasado.
4.  **Captura de pantalla:** Si es un error visual.
