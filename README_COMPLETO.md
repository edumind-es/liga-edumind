# LIGA EDUMIND - Sistema de Gestión de Ligas Escolares con Evaluación de Valores

![Liga EDUmind](https://img.shields.io/badge/EDUmind-Liga-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-AGPL%20v3.0-green?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square)

## 📖 Descripción

**Liga EDUmind** es una plataforma innovadora para gestionar ligas deportivas escolares con un enfoque en la evaluación de valores mediante la **metodología MRPS** (Marca, Responsabilidad, Participación, Superación). Va más allá del marcador tradicional, evaluando el desarrollo integral del estudiante a través del deporte.

### Características Revolucionarias

- ⚽ **Multideporte:** Fútbol, baloncesto, voleibol, balonmano + deportes personalizados
- 📊 **Sistema MRPS:** Evaluación cuantitativa de valores educativos
- 🗓️ **Generador de Calendarios Automático:** Algoritmo Round-Robin (Berger)
- 👥 **Gestión de Equipos:** Logos, composición, estadísticas completas
- 🏆 **Clasificaciones Dinámicas:** Actualización en tiempo real
- 📝 **Acta Digital de Partido:** Registro completo con valores educativos
- 🎯 **Roles Diferenciados:** Profesor, equipo jugador, equipo árbitro, grada
- 🔐 **Acceso Público con PIN:** Estudiantes ven clasificación sin login
- 📧 **Notificaciones Automáticas:** Emails de convocatorias y resultados

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Backend:**
- **Framework:** FastAPI (async/await)
- **ORM:** SQLAlchemy 2.0 (asyncpg)
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Migrations:** Alembic
- **Validación:** Pydantic v2
- **Email:** SMTP2Go integration
- **Auth:** JWT con refresh tokens

**Frontend:**
- **Framework:** React 19 + Vite
- **Language:** TypeScript 5.9
- **UI Library:** Tailwind CSS 4 + shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod

**DevOps:**
- **Containerization:** Docker + Docker Compose
- **Proxy:** Nginx con SSL (Let's Encrypt)
- **Monitoring:** Matomo Analytics (opcional)

### Diagrama de Arquitectura

```
┌─────────────────┐
│   FRONTEND      │
│   React + Vite  │─────────┐
│ (port: 5173)    │         │
└─────────────────┘         │
                            │ HTTP/HTTPS
┌─────────────────┐         │
│     NGINX       │◄────────┘
│  Reverse Proxy  │
│   (SSL + WAF)   │
└────────┬────────┘
         │
    ┌────▼────┐
    │ BACKEND │
    │ FastAPI │────────┐
    │ :8001   │        │
    └────┬────┘        │
         │             │
    ┌────▼────┐   ┌────▼────┐
    │PostgreSQL│   │  Redis  │
    │   :5432  │   │  :6379  │
    └──────────┘   └─────────┘
```

### Estructura de Directorios

```
liga_edumind/
├── backend/
│   ├── app/
│   │   ├── main.py                     # Punto de entrada FastAPI
│   │   ├── config.py                   # Settings (Pydantic)
│   │   ├── database.py                 # Async engine SQLAlchemy
│   │   ├── api/
│   │   │   ├── deps.py                 # Dependencias (auth, DB)
│   │   │   └── v1/
│   │   │       ├── auth.py             # Login, registro, JWT
│   │   │       ├── ligas.py            # CRUD ligas
│   │   │       ├── equipos.py          # Gestión equipos
│   │   │       ├── jornadas.py         # Jornadas y calendario
│   │   │       ├── partidos.py         # Gestión partidos + MRPS
│   │   │       ├── tipos_deporte.py    # Configuración deportes
│   │   │       └── public.py           # Endpoints públicos (PIN)
│   │   ├── models/
│   │   │   ├── user.py                 # Modelo docente
│   │   │   ├── liga.py                 # Liga (season)
│   │   │   ├── equipo.py               # Equipo (team)
│   │   │   ├── partido.py              # Partido (match)
│   │   │   ├── jornada.py              # Jornada (round)
│   │   │   ├── tipo_deporte.py         # Sport config
│   │   │   └── acta_partido.py         # Match report
│   │   ├── schemas/
│   │   │   └── *.py                    # Pydantic schemas (DTO)
│   │   ├── services/
│   │   │   ├── calendar_generator.py   # Algoritmo Round-Robin
│   │   │   ├── clasificacion_service.py# Cálculo clasificaciones
│   │   │   └── email_service.py        # Envío notificaciones
│   │   └── utils/
│   │       └── security.py             # JWT, hashing
│   ├── alembic/
│   │   └── versions/                   # Migraciones DB
│   ├── static/uploads/                 # Archivos subidos (logos)
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── Liga/
│   │   │   │   ├── CrearLiga.tsx
│   │   │   │   ├── VerLiga.tsx          # Vista principal liga
│   │   │   │   └── Clasificacion.tsx    # Tabla clasificación
│   │   │   ├── Equipo/
│   │   │   │   ├── GestionEquipos.tsx
│   │   │   │   └── EquipoCard.tsx
│   │   │   ├── Partido/
│   │   │   │   ├── VerPartido.tsx       # Acta digital
│   │   │   │   ├── MarcadorSlider.tsx   # Sliders MRPS
│   │   │   │   └── SeleccionArbitro.tsx
│   │   │   └── Jornada/
│   │   │       └── CalendarioJornadas.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts                # TanStack Query
│   │   ├── services/
│   │   │   └── api.ts                   # Axios client
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript interfaces
│   │   └── styles/
│   │       └── tailwind.config.js
│   ├── package.json
│   └── vite.config.ts
│
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 Instalación y Despliegue

### Opción 1: Docker Compose (Recomendado)

```bash
# Clonar repositorio
git clone https://github.com/edumind-es/liga-edumind.git
cd liga_edumind

# Configurar variables de entorno
cp backend/.env.example backend/.env
nano backend/.env  # Editar credenciales

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Aplicar migraciones
docker-compose exec backend alembic upgrade head
```

**Servicios activos:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8001
- PostgreSQL: localhost:5433
- Redis: localhost:6380

### Opción 2: Instalación Manual

#### Backend

```bash
cd backend

# Entorno virtual
python3.11 -m venv venv
source venv/bin/activate

# Dependencias
pip install -r requirements.txt

# Configurar .env
cp .env.example .env

# Migraciones
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend

```bash
cd frontend

# Dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

### Configuración Nginx (Producción)

```nginx
# /etc/nginx/sites-available/liga.edumind.es
server {
    listen 443 ssl http2;
    server_name liga.edumind.es;

    ssl_certificate /etc/letsencrypt/live/liga.edumind.es/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/liga.edumind.es/privkey.pem;

    # Frontend
    root /var/www/liga_edumind/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (uploads)
    location /static {
        proxy_pass http://127.0.0.1:8001;
    }
}
```

---

## 🎯 Funcionamiento

### Flujo de Trabajo Completo

#### 1. Creación de Liga (Profesor)

```
Profesor → Login → Dashboard → "Crear Liga"
  ├─ Nombre: "Liga EDUmind  2025"
  ├─ Deporte: Fútbol Sala
  ├─ Fecha inicio/fin
  └─ Guardar
```

#### 2. Gestión de Equipos

```
VerLiga → Pestaña "Equipos" → "Añadir Equipo"
  ├─ Nombre: "Los Cohetes 3ºA"
  ├─ Logo (upload)
  ├─ Tipo: Jugador, Árbitro, o Grada
  └─ Crear
```

**Tipos de Equipos:**
- **Jugador:** Compite en partidos
- **Árbitro:** Evalúa partidos (rotación automática)
- **Grada:** Evalúa como espectador educado

#### 3. Generación de Calendario

```typescript
// Algoritmo Round-Robin (Berger)
// Ejemplo: 6 equipos → 5 jornadas

Jornada 1: A vs B, C vs F, D vs E
Jornada 2: B vs F, A vs E, C vs D
Jornada 3: F vs E, B vs D, A vs C
Jornada 4: E vs D, F vs C, B vs A
Jornada 5: D vs C, E vs A, F vs B
```

**Características:**
- Todos juegan contra todos exactamente 1 vez
- Distribución equitativa de partidos
- Asignación automática de árbitros
- Sin partidos repetidos

#### 4. Gestión de Partido

**Antes del Partido:**
```
VerPartido → Estado: "Programado"
  ├─ Equipos: Local vs Visitante
  ├─ Árbitro: Asignado automáticamente
  ├─ Grada: Asignada automáticamente
  ├─ Fecha/hora
  └─ Convocatoria (email automático)
```

**Durante el Partido:**
```
VerPartido → "Iniciar Partido"
  ├─ Marcador Tradicional:
  │   ├─ Goles Local: 0-10
  │   └─ Goles Visitante: 0-10
  │
  └─ Evaluación MRPS (Sliders 0-4):
      ├─ MARCA (M): Identidad/Fair Play
      ├─ RESPONSABILIDAD (R): Compromiso
      ├─ PARTICIPACIÓN (P): Inclusión
      └─ SUPERACIÓN (S): Esfuerzo/Mejora
```

**Después del Partido:**
```
VerPartido → "Finalizar Partido"
  ├─ Guardar resultados
  ├─ Clasific. se actualiza automáticamente
  ├─ Email a equipos con resultado
  └─ Acta digital disponible
```

### Sistema de Puntuación

#### Puntos de Partido

```python
# Configuración por deporte (tipo_deporte.py)
{
  "puntos_victoria": 3,
  "puntos_empate": 1,
  "puntos_derrota": 0
}
```

#### Puntos MRPS

Cada valor (M, R, P, S) otorga de 0 a 4 puntos:
- **0:** Sin cumplimiento
- **1:** Cumplimiento bajo
- **2:** Cumplimiento medio
- **3:** Cumplimiento alto
- **4:** Cumplimiento excepcional

**Ejemplo:**
```
Partido: Los Cohetes 3ºA (5) vs Los Relámpagos 3ºB (3)

Los Cohetes:
  - Victoria: 3 puntos
  - M: 4 puntos (Fair play excepcional)
  - R: 3 puntos (Alta responsabilidad)
  - P: 4 puntos (Todos participaron)
  - S: 3 puntos (Gran esfuerzo)
  TOTAL: 3 + 4 + 3 + 4 + 3 = 17 puntos
```

#### Clasificación

Ordenación por:
1. **Puntos totales** (partido + MRPS)
2. **Diferencia de goles** (desempate)
3. **Goles a favor**
4. **Enfrentamientos directos**

---

## 📊 API Reference

### Autenticación

**POST** `/api/v1/auth/register`
```json
{
  "email": "profesor@colegio.es",
  "nombre": "María García",
  "password": "SecurePass123!"
}
```

**POST** `/api/v1/auth/login`
```json
// Request
{
  "username": "profesor@colegio.es",
  "password": "SecurePass123!"
}

// Response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Ligas

**POST** `/api/v1/ligas`
```json
{
  "nombre": "Liga EDUmind 2025",
  "tipo_deporte_id": 1,
  "fecha_inicio": "2025-01-15",
  "fecha_fin": "2025-06-30",
  "pin_acceso_publico": "1234"  // Opcional
}
```

**GET** `/api/v1/ligas/{liga_id}/clasificacion`
```json
{
  "clasificacion": [
    {
      "posicion": 1,
      "equipo": {
        "id": 5,
        "nombre": "Los Cohetes 3ºA",
        "logo_url": "/static/uploads/cohetes_logo.png"
      },
      "partidos_jugados": 5,
      "victorias": 4,
      "empates": 1,
      "derrotas": 0,
      "goles_favor": 24,
      "goles_contra": 8,
      "puntos_partido": 13,
      "puntos_mrps": 72,
      "puntos_totales": 85
    }
  ]
}
```

### Partidos

**PUT** `/api/v1/partidos/{partido_id}/resultado`
```json
{
  "marcador_local": 5,
  "marcador_visitante": 3,
  "valores_local": {
    "marca": 4,
    "responsabilidad": 3,
    "participacion": 4,
    "superacion": 3
  },
  "valores_visitante": {
    "marca": 3,
    "responsabilidad": 4,
    "participacion": 3,
    "superacion": 4
  },
  "observaciones": "Partido muy reñido, excelente deportividad."
}
```

### Acceso Público

**POST** `/api/v1/public/ligas/verificar-pin`
```json
{
  "pin": "1234"
}
// Response: información liga + clasificación
```

---

## 🔐 Seguridad

### Mejores Prácticas Implementadas

✅ **JWT con expiración:**
- Access token: 30 minutos
- Refresh token: 7 días

✅ **Passwords hasheados:** bcrypt con salt

✅ **CORS restringido:** Solo dominios autorizados

✅ **SQL Injection protegido:** SQLAlchemy ORM

✅ **XSS protegido:** Sanitización de inputs

✅ **HTTPS obligatorio:** SSL/TLS en producción

✅ **Rate limiting:** Configurado en Nginx

### Configuración de Seguridad

```python
# backend/app/config.py
class Settings(BaseSettings):
    SECRET_KEY: str  # ⚠️ CAMBIAR en producción
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = [
        "https://liga.edumind.es"  # ✅ Solo dominios confiables
    ]
```

---

## 🧪 Testing

### Backend

```bash
cd backend

# Tests unitarios
pytest app/tests/ -v

# Tests de integración
pytest app/tests/integration/ -v

# Coverage
pytest --cov=app --cov-report=html
```

### Frontend

```bash
cd frontend

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 📱 Casos de Uso

### Caso 1: Liga de Fútbol Sala (Primaria)

**Contexto:** Colegio con 8 clases de 3º y 4º de Primaria

**Setup:**
- Deporte: Fútbol Sala
- 6 equipos jugadores (clases mezcladadas)
- 1 equipo árbitro (rotación por jornada)
- 1 equipo grada (estudiantes no jugadores)
- 5 jornadas (todos contra todos)

**Beneficios:**
- Desarrollo físico + valores
- Responsabilidad como árbitros
- Espíritu deportivo en la grada
- Datos cuantitativos para tutorías

### Caso 2: Liga de Baloncesto (Secundaria)

**Contexto:** Instituto con competición interdepartamental

**Setup:**
- Deporte: Baloncesto 3x3
- 10 equipos (representan diferentes cursos)
- Sistema de playoffs tras fase regular
- Streaming de partidos importantes
- Ranking MRPS publicado semanalmente

**Impacto Educativo:**
- Competencia sana
- Visibilidad de valores
- Implicación de toda la comunidad educativa

---

## 🐛 Troubleshooting

### Backend no conecta con PostgreSQL

```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose ps

# Ver logs de base de datos
docker-compose logs db

# Verificar credenciales en .env
cat backend/.env | grep DATABASE_URL
```

### Frontend no muestra datos

```bash
# Verificar proxy en vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8001'
    }
  }
});
```

### Error en migración Alembic

```bash
# Rollback a versión anterior
alembic downgrade -1

# Regenerar migración
alembic revision --autogenerate -m "nueva_migracion"
```

---

## 📈 Roadmap

### v1.1 (Q1 2026) - Mejoras UX
- [ ] App móvil (React Native)
- [ ] Modo offline (PWA avanzado)
- [ ] Gráficos de evolución MRPS
- [ ] Exportación de informes PDF

### v1.2 (Q2 2026) - Gamificación
- [ ] Badges y logros
- [ ] Sistema de rankings históricos
- [ ] Comparativas entre ligas
- [ ] Predicciones IA de resultados

### v2.0 (Q3 2026) - Multiplataforma
- [ ] Integración con Google Classroom
- [ ] API pública para terceros
- [ ] Torneos intercolegiales
- [ ] Streaming integrado

---

## 📄 Licencia

**GNU Affero General Public License v3.0**

Software libre y open-source. Cualquier modificación debe mantener la licencia y proporcionar código fuente.

---

## 👥 Autores

**EDUmind Team - Los Mundos Edufis**

Ver [AUTHORS](AUTHORS) para lista completa.

---

## 🙏 Agradecimientos

- **Metodología MRPS:** Inspirada en pedagogías humanistas
- **Algoritmo Berger:** Sistema clásico de Round-Robin
- **Comunidad EDUmind:** Feedback invaluable de profesores

---

**Última actualización:** Diciembre 2025  
**Versión:** 1.0.0  
**Estado:** Producción
