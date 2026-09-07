# Kuvo backend

One API. Many clients. Kuvo phone (Expo), later web, later PC all talk to the **same** Go service.

Building a separate backend per platform is not professional. It doubles auth, chat, and campus rules, and the products drift. WhatsApp, Slack, Discord, and Telegram all run one backend; the apps are just clients.

---

## 1. Principle: the backend is the product

| Layer | What it is | Who uses it |
| --- | --- | --- |
| **API + WebSocket** | The Kuvo backend. Auth, chats, groups, gist, media, settings. | Phone, web, PC |
| **Clients** | UI only. They never own business rules. | Expo app now; web and desktop later |

If a rule matters (who can see a campus group, OTP cooldown, block lists), it lives in Go. If it is pixels (theme, wallpaper, composer), it lives in the client.

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Expo app   │  │  Web (later)│  │  PC (later) │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │ REST + JWT     │ same           │ same
       │ WebSocket      │ contract       │ contract
       └────────────────┴────────────────┘
                        │
              ┌─────────▼─────────┐
              │   Kuvo API (Go)   │
              │  Gin + WS Hub     │
              └─────────┬─────────┘
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   PostgreSQL         Redis      Cloudflare R2
```

Web and PC do **not** wait for a second backend. When you add them, they call this API. The only extra work is UI plus:

- **CORS** on Gin (needed for browsers; native apps ignore it)
- **Token storage** (SecureStore on phone, httpOnly cookies or memory on web)
- Same JWT, same `/v1/*`, same WS frames

---

## 2. Core tech stack

- **API:** Go + **Gin**
- **Database:** **PostgreSQL** (Docker locally; Neon/Supabase later)
- **Cache / broker:** **Redis** — OTP (5 min TTL), presence, rate limits, Pub/Sub across API nodes
- **Realtime:** **Gorilla WebSocket** — Hub + per-connection read/write goroutines
- **Media:** **Cloudflare R2** (S3-compatible, no egress) via **presigned URLs** so clients upload directly

Authz is **Go middleware and handlers**, not Postgres RLS. The database is private. Clients never talk to Postgres.

---

## 3. How a message moves

1. Any client opens `wss://…/v1/ws` with a JWT.
2. The Hub maps `userID → connection(s)` (a user can be on phone and web at once).
3. `send_message` is persisted in Postgres.
4. The Hub pushes to sockets on this process; Redis Pub/Sub (`conv:{id}`) fans out to other API processes.
5. Offline devices get push later (not slice 1).

OTP, presence TTL, and rate limits belong in Redis. Chat history belongs in Postgres. Files belong in R2.

---

## 4. Repo

```
server/                 Go API (the only backend)
  cmd/api/main.go
  internal/http/        Gin routes + middleware
  internal/ws/          Hub, client loops, events
  internal/auth/        OTP + JWT
  internal/store/       Postgres
  internal/cache/       Redis
  internal/media/       R2 presign
  migrations/
  docker-compose.yml    postgres + redis + api

app/                    Expo phone client (calls the API)
docs/BACKEND.md         this file
```

Clients set:

- `EXPO_PUBLIC_API_URL` / `VITE_API_URL` → `https://api.example.com`
- `EXPO_PUBLIC_WS_URL` / `VITE_WS_URL` → `wss://api.example.com/v1/ws`

---

## 5. Auth (same for every client)

- `POST /v1/auth/otp/request` `{ country_code, phone }`
- `POST /v1/auth/otp/verify` → `{ access_token, refresh_token, user }`
- `POST /v1/auth/refresh`
- Access JWT ~15 min, refresh ~30 days (Postgres `refresh_tokens`, rotatable)
- Phone E.164 unique, **never** in other users’ JSON
- Username is public (how people start DMs)
- `+233` and `+234` from day one
- Dev: Redis OTP + accept `1234` when `APP_ENV=dev`. Paid SMS (Termii / Africa’s Talking) later, same endpoints.

---

## 6. HTTP surface (versioned `/v1`)

Unchanged across phone/web/PC.

**Identity:** `GET/PATCH /v1/me`, campuses list/search, add-campus request, campus verify email/id.

**Chats:** list conversations, open DM by username, page messages, mark read, clear-for-me, blocks.

**Groups:** create, add members, leave, mute.

**Media:** `POST /v1/media/presign` then client PUT to R2.

**Gist / stories:** campus-scoped; campus-only if `verified` and same campus.

**Health:** `GET /v1/health` (no auth).

Send path for live chat is **WebSocket**, not POST, so all clients stay in sync.

---

## 7. WebSocket contract

Connect: `GET /v1/ws` with `Authorization: Bearer <access>`.

Client → server: `send_message`, `typing`, `ping`.  
Server → client: `message`, `message_ack`, `typing`, `presence`, `error`.

Hub: one process goroutine; each socket has a read loop, write loop, and buffered send channel. Ping every 30s. Presence: Redis `SET presence:{user} EX 60`. Honor `show_last_seen`.

A logged-in user on web **and** phone gets the same events on both connections.

---

## 8. Postgres (owned by Go)

`users`, `profiles`, `campuses` (seed all GH + NG unis), `campus_requests`, `conversations`, `conversation_members`, `messages`, `blocks`, `refresh_tokens`, later `stories` and `gist_posts`.

Direct chats: exactly two members; unique pair.  
`cleared_at` is per member (clear chat for me, not for them).  
Phone numbers never leave the API in other people’s payloads.

---

## 9. Redis

- `otp:{e164}` TTL 300s  
- `otp:tries:{e164}`  
- `rl:otp:{ip}` / `rl:otp:{e164}`  
- `presence:{userId}` TTL 60s  
- `upload:{user}:{key}` TTL 10 min (presign can only be attached by that user)  
- Pub/Sub `conv:{id}`

---

## 10. R2

Prefixes: `avatars/`, `chat/`, `stories/`, `campus-ids/`.  
Presign PUT after authz. Chat GET is a short-lived presigned URL. Campus IDs stay private.  
Low data mode is a **client** choice; the server still stores full files.

Until R2 is configured, local disk or MinIO behind the same presign interface.

---

## 11. Local development

Default: `APP_STORE=memory`. `go run ./cmd/api` — no Docker, no cloud keys.

Later: `APP_STORE=postgres` + `docker compose up postgres redis -d`. Same API. R2/Termii stay off until a later slice.

Later public demo: Neon (Postgres) + Upstash (Redis) + Fly/Railway (Go) + real R2. Same binary, different env.

---

## 12. Build order

0. `server/` skeleton, compose, health, migrations (users/profiles/campuses)  
1. OTP + JWT + `/me` + campus list/add — Expo onboarding calls it  
2. Conversations + WS Hub + DM text  
3. Groups + R2 presign + media  
4. Gist, stories, campus verify  
5. Presence, push, SMS provider  

Web and PC clients start whenever you want after slice 1: they are new UIs on this API, not new backends.

---

## 13. What we will not do

- A second “web backend” or Firebase next to Go  
- Paid SMS in v1  
- Kafka / microservices / multi-region  
- Video calls  
- Postgres RLS as the primary authz layer (Go owns it; DB is not public)
