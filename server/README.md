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

**Database (no key paste):** `render.yaml` creates a Render Postgres (`kuvo-db`) and injects `DATABASE_URL` for you. In the Render dashboard you add the Blueprint / web service from this repo, root directory `server`. You do not open Supabase unless you want to.

**Supabase is optional.** If you later prefer Supabase’s site, copy the Postgres URI (not the anon JWT) into `DATABASE_URL`. That is a database login for the server, not a public app key.

**Cloudflare R2** still needs access keys in Render env vars. There is no “connect R2” button that skips keys — that is how object storage works. Until R2 is set, files stay on the API disk (fine for a first Render test, not for two phones after a restart).

1. Connect GitHub repo `Tonna2007/kuvo` on Render.
2. Root directory: `server`. Docker. Health check: `/v1/health`.
3. Apply the Blueprint so `kuvo-db` is created and linked.
4. **Termii:** leave empty. Code stays `1234`.
5. Send the public API URL (e.g. `https://kuvo-api.onrender.com`) so the APK can be rebuilt against it.

## Layout

- `cmd/api` — process entry
- `internal/http` — Gin routes
- `internal/auth` — phone, OTP, JWT
- `internal/store` — Postgres
- `internal/cache` — Redis
- `migrations` — SQL applied on boot
