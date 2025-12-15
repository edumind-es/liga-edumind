#!/bin/bash
# Script to initialize database and create first migration

set -euo pipefail

echo "🔧 Inicializando base de datos..."

cd /var/www/liga_edumind/backend

# Activate venv if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Archivo .env no encontrado. Copia .env.example a .env primero."
    exit 1
fi

# Initialize Alembic if needed
if [ ! -d "alembic/versions" ] || [ -z "$(ls -A alembic/versions 2>/dev/null)" ]; then
    echo "📝 Creando primera migración..."
    alembic revision --autogenerate -m "Initial migration: create users table"
fi

# Run migrations
echo "⬆️  Aplicando migraciones..."
alembic upgrade head

echo "✅ Base de datos inicializada correctamente!"
echo ""
echo "Próximos pasos:"
echo "  - Iniciar backend: cd backend && uvicorn app.main:app --reload"
echo "  - O usar Docker: docker compose up -d"
