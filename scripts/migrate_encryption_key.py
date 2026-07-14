#!/usr/bin/env python3
"""
Migración de clave de cifrado Nextcloud.

Uso:
    cd /var/www/liga_edumind/backend
    python ../scripts/migrate_encryption_key.py --new-key <NUEVA_ENCRYPTION_KEY> [--dry-run]

Este script re-cifra las credenciales Nextcloud almacenadas en BD usando la nueva
clave dedicada (ENCRYPTION_KEY), en lugar de la clave derivada de SECRET_KEY.

PASOS:
1. El sistema actual cifra con SHA256(SECRET_KEY).
2. Este script descifra con SHA256(SECRET_KEY) y vuelve a cifrar con NUEVA_ENCRYPTION_KEY.
3. Tras la migración, añadir ENCRYPTION_KEY=<nueva_clave> al .env y reiniciar.

Verificar primero con --dry-run (no escribe nada en BD).
"""

import argparse
import asyncio
import base64
import hashlib
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

# Cargar .env manualmente para que funcione fuera del contexto de la app
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))


def _build_fernet_from_secret(secret_key: str):
    from cryptography.fernet import Fernet
    key_hash = hashlib.sha256(secret_key.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key_hash))


def _build_fernet_from_key(encryption_key: str):
    from cryptography.fernet import Fernet
    return Fernet(encryption_key.encode())


async def run_migration(new_key: str, dry_run: bool) -> None:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import select, text

    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url:
        print("ERROR: DATABASE_URL no encontrada en .env")
        sys.exit(1)

    secret_key = os.environ.get("SECRET_KEY", "")
    if not secret_key:
        print("ERROR: SECRET_KEY no encontrada en .env")
        sys.exit(1)

    old_fernet = _build_fernet_from_secret(secret_key)
    new_fernet = _build_fernet_from_key(new_key)

    engine = create_async_engine(database_url, echo=False)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text("SELECT id, email, nextcloud_password_enc FROM users WHERE nextcloud_password_enc IS NOT NULL")
        )
        rows = result.fetchall()

    if not rows:
        print("No hay credenciales Nextcloud almacenadas. Nada que migrar.")
        print("Puedes añadir ENCRYPTION_KEY al .env directamente.")
        return

    print(f"Encontrados {len(rows)} usuarios con credenciales Nextcloud.")

    migrated = 0
    errors = 0

    async with AsyncSessionLocal() as db:
        for row in rows:
            user_id, email, enc = row.id, row.email, row.nextcloud_password_enc
            try:
                # Descifrar con clave antigua
                plain = old_fernet.decrypt(enc.encode()).decode()

                # Volver a cifrar con clave nueva
                new_enc = new_fernet.encrypt(plain.encode()).decode()

                if dry_run:
                    print(f"  [DRY-RUN] id={user_id} ({email}): OK (descifrado y re-cifrado correctamente)")
                else:
                    await db.execute(
                        text("UPDATE users SET nextcloud_password_enc = :enc WHERE id = :id"),
                        {"enc": new_enc, "id": user_id}
                    )
                    print(f"  [MIGRADO] id={user_id} ({email}): OK")
                migrated += 1

            except Exception as exc:
                print(f"  [ERROR] id={user_id} ({email}): {exc}")
                errors += 1

        if not dry_run and migrated > 0:
            await db.commit()

    print()
    if dry_run:
        print(f"DRY-RUN completado: {migrated} se pueden migrar, {errors} errores.")
        print("Si no hay errores, ejecuta sin --dry-run para aplicar los cambios.")
    else:
        print(f"Migración completada: {migrated} migrados, {errors} errores.")
        if errors == 0:
            print()
            print("SIGUIENTE PASO: añade esta línea al .env del backend y reinicia el servicio:")
            print(f"  ENCRYPTION_KEY={new_key}")


def main():
    parser = argparse.ArgumentParser(description="Migración de clave de cifrado Nextcloud")
    parser.add_argument("--new-key", required=True, help="Nueva ENCRYPTION_KEY (Fernet key)")
    parser.add_argument("--dry-run", action="store_true", help="Simular sin escribir en BD")
    args = parser.parse_args()

    # Validar formato de la nueva clave
    try:
        from cryptography.fernet import Fernet
        Fernet(args.new_key.encode())
    except Exception:
        print("ERROR: --new-key no es una Fernet key válida.")
        print("Genera una con: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"")
        sys.exit(1)

    asyncio.run(run_migration(args.new_key, args.dry_run))


if __name__ == "__main__":
    main()
