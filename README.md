# Liga EDUmind

Liga EDUmind is an educational league management app with a FastAPI
backend and React frontend for classroom sports, teams, matches and public
views.

This public repository is a sanitized source release for code review,
educational reuse and community audit. Production secrets, deployment
configuration, private runbooks, SQL backups, uploaded files and user data
are not included.

## Development

Frontend:

```bash
cd frontend
npm install
npm run build
```

Backend:

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

Use `.env.example` as a placeholder template only.

## Release Scope

See `OPEN_SOURCE_RELEASE.md` for what is included and excluded.

## License

Licensed under `AGPL-3.0-or-later OR EUPL-1.2`.

EDUmind(R), logos and brand assets are reserved. See `TRADEMARKS.md`.
