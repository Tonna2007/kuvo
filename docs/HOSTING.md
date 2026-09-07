# Host Kuvo (detailed)

The phone app only talks to **one** URL: the Go API.  
It never uses a Supabase API key, Cloudflare key, or Termii key.

---

## What the Supabase “GitHub / integrate repo” button does

It lets **Supabase** watch your GitHub repo for a `supabase/` folder (SQL migrations, Edge Functions).

It does **not**:

- host the Kuvo Go server
- give you `https://….onrender.com`
- skip DATABASE_URL for a server running on Render
- make photos work

**Skip Supabase for the first deploy.** Use Render’s own Postgres. You never copy a database URL.

---

## 1. GitHub (already done)

Repo: https://github.com/Tonna2007/kuvo

You should be logged in as **Tonna2007**.

---

## 2. Render — create the API + database from the site

1. Open https://dashboard.render.com and sign in (GitHub login is fine).
2. If it asks to connect GitHub, allow access to **Tonna2007/kuvo**.
3. Click **Blueprints** (or **New +** → **Blueprint**).
4. Select the repo **kuvo**.
5. Render should see `render.yaml` at the repo root. Apply it.
6. You should get two things:
   - **kuvo-db** — Postgres (Render creates this; no URL to hunt)
   - **kuvo-api** — the Go API (Docker, built from `server/`)
7. For R2 / Termii fields that say “sync: false”, leave them **blank** for now. Click apply / save.
8. Wait until **kuvo-api** is **Live**. Open the service page.
9. Copy the public URL, like `https://kuvo-api.onrender.com`.
10. In the browser open `https://YOUR-SERVICE.onrender.com/v1/health`  
    You want something like `{"ok":true,"service":"kuvo-api"}`.

Send that `https://…onrender.com` URL (no trailing slash). Then the APK can be pointed at the cloud.

### If Blueprint is missing or `plan: free` is rejected

Do it by hand:

1. **New +** → **PostgreSQL**. Name `kuvo-db`. Cheapest plan. Create.
2. **New +** → **Web Service** → connect **Tonna2007/kuvo**.
3. Settings:
   - **Root directory:** `server`
   - **Runtime / Language:** Docker
   - **Dockerfile path:** `Dockerfile` (inside `server`)
   - **Health check path:** `/v1/health`
4. Environment:
   - `APP_ENV` = `prod`
   - `APP_STORE` = `postgres`
   - `DEV_OTP` = `1234`
   - `STRICT_OTP` = `0`
   - `CORS_ORIGINS` = `*`
   - `DATABASE_URL` → click **Add from database** / link **kuvo-db** (internal URL). Do not paste a Supabase key.
   - Leave JWT_SECRET / OTP_PEPPER to generate, or type long random strings.
5. Deploy. Copy the `https://…onrender.com` URL.

---

## 3. Cloudflare R2 (only when you want photos to last)

Skip this for the first “is the API live?” test.

1. https://dash.cloudflare.com → **R2**.
2. Create bucket `kuvo-media`.
3. Enable a **public** development URL (or custom domain). Copy it (`https://pub-….r2.dev`).
4. **Manage R2 API tokens** → create token with Object Read & Write on that bucket.  
   You get **Access Key ID** and **Secret Access Key**. Also note **Account ID** (right sidebar of Cloudflare).
5. On Render → **kuvo-api** → **Environment**:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET` = `kuvo-media`
   - `R2_PUBLIC_BASE` = the public URL with no trailing slash
6. Redeploy **kuvo-api**.

Until this is set, files sit on the API container disk and vanish on restart.

---

## 4. Termii (skip)

Leave `TERMII_API_KEY` empty. The app code is **1234**.  
Tap **Send code (SMS test)** only after you add a Termii key later.

---

## 5. What you send back

One line:

`https://kuvo-api-xxxx.onrender.com`

Then the APK is rebuilt with that URL. Do not look for a Supabase URL for the phone.

---

## 6. If you still want Supabase later

GitHub integration on Supabase ≠ hosting Kuvo.

You would still open **Project Settings → Database** and copy the **URI** (postgres://…), then paste it as `DATABASE_URL` on Render. That is a database password for the **server**, not an API key in the app. Render Postgres avoids this step.
