# Kuvo API

Single backend for the Kuvo phone app, and later web and PC. Clients speak REST + JWT + WebSocket.

## Run locally (no Docker, no cloud APIs)

Default is **in-memory**. No Postgres, Redis, Supabase, Cloudflare, or Termii.

If `go` is not recognized, open a **new** PowerShell (Go was just installed) or run:

```powershell
cd server
.\run.ps1
```

Or:

```powershell
$env:Path = "C:\Program Files\Go\bin;" + $env:Path
cd server
go run ./cmd/api
```

Health:

```powershell
curl http://localhost:8080/v1/health
```

Dev OTP is `1234`. Tap **Send code (SMS test)** in the app only when `TERMII_API_KEY` is set.

## Host on Render (or similar)

1. Create a GitHub repo (this project) and connect it on Render.
2. Root directory: `server`. Docker runtime. Health check: `/v1/health`.
3. Env vars: copy `.env.example`.
4. **Supabase:** paste `DATABASE_URL` (Postgres URI). Set `APP_STORE=postgres`.
5. **Cloudflare R2:** API tokens + `R2_PUBLIC_BASE` (public bucket URL). Photos then live in R2, not on the laptop.
6. **Termii:** leave empty until you want to spend SMS. Code stays `1234`.
7. Send the public API URL (e.g. `https://kuvo-api.onrender.com`) so the APK can be rebuilt against it.

## Layout

- `cmd/api` — process entry
- `internal/http` — Gin routes
- `internal/auth` — phone, OTP, JWT
- `internal/store` — Postgres
- `internal/cache` — Redis
- `migrations` — SQL applied on boot
