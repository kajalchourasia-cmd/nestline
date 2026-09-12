# Maya AI demo API

This is the thin integration layer for the existing React interface. It exposes
only the controlled fictional demo. Real medical-document upload and Personal
Mode remain intentionally disabled until authentication, private storage,
malware scanning, extraction, confirmation, and production evidence releases
are configured.

Run from the repository root:

```bash
uvicorn api.main:app --reload --port 8000
```

The frontend uses `NEXT_PUBLIC_MAYA_API_URL` (default:
`http://127.0.0.1:8000`).
