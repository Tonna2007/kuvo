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

The phone never uses a Supabase or Cloudflare **API key**. It only calls this Go API.

**Database (Supabase PostgreSQL):** The backend uses Supabase PostgreSQL as its default database via `DATABASE_URL`. In your Supabase dashboard, navigate to **Project Settings -> Database -> Connection String (URI)** and set `DATABASE_URL` in your Render environment variables.

**Cloudflare R2** needs access keys in Render env vars (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE`). Until R2 is set, files stay on the API disk (fine for local testing, but R2 is required for production).

**Do not** use Supabase → Settings → GitHub integration. That only syncs Supabase edge functions/migrations. Render runs the Go API server, which connects to your Supabase Postgres database via `DATABASE_URL`.

Use **Render + GitHub** instead (steps in the message / HOSTING.md).

## Layout

- `cmd/api` — process entry
- `internal/http` — Gin routes
- `internal/auth` — phone, OTP, JWT
- `internal/store` — Postgres
- `internal/cache` — Redis
- `migrations` — SQL applied on boot
