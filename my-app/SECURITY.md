# Security & Production Readiness

## ✅ Cyber Security Implemented

### 1. HTTP Security Headers (Helmet + Next headers)
- HSTS `max-age=31536000 includeSubDomains preload`
- CSP (prod): default-src 'self', script-src 'self' unsafe-inline, img-src https, connect-src wss
- X-Frame-Options: SAMEORIGIN (clickjacking)
- X-Content-Type-Options: nosniff (MIME sniffing)
- Referrer-Policy, Permissions-Policy, poweredByHeader disabled
- Verified via `curl -I /api/health`

### 2. Injection Protection
- `express-mongo-sanitize` → NoSQL injection
- `xss-clean` + `xss` lib → XSS sanitization
- `hpp` → HTTP Parameter Pollution
- `express-validator` → input validation (email normalize, password length, escaping)

### 3. Auth Hardening
- JWT stored httpOnly Secure SameSite=Lax cookie + Bearer header fallback
- bcrypt 12 rounds, strong password policy: min 8, upper+lower+number
- First user auto admin, others editor unless admin creates them
- `isActive` check disables accounts
- JWT expiry 7d, secret must be 64 hex (rotated from placeholder)
- `/auth/change-password` requires current password

### 4. Brute-force & IP Block
- Rate limiters: API 300/15min, auth 20/15min, strict 5 fails/15min
- LoginLog collection tracks every attempt (ip, ua, success/failed)
- After 5 fails/15min → BlockedIp auto-create 30min block
- Admin can view `GET /api/security/login-logs` and manage `GET/POST/DELETE /api/security/blocked`
- `middleware/blockCheck` rejects blocked IPs early (bypasses if DB down)

### 5. Audit & Activity Log
- `ActivityLog` captures every POST/PUT/DELETE with user, module, ip, userAgent, details
- View at `GET /api/security/activity-logs` → UI at `/Akramadmin/activity-log`
- Can clear/export (CSV in spec → JSON here, extendable)

### 6. File Upload Security
- Whitelist mimetype: jpeg/png/webp/pdf only
- Multer limits: 5MB, 10 files max
- Cloudinary `resource_type` correct, sanitized public_id, auto quality, folder `mycompany`
- ErrorHandler returns 400 on invalid type/size

### 7. Backup & Recovery
- `POST /api/backup/create` → JSON dump of all collections to `backups/` (keeps last 10)
- `GET /api/backup/list`, `POST /api/backup/restore` (logged as Activity), `DELETE /api/backup/:file`
- Admin UI at `/Akramadmin/backup` with progress + warnings
- Prod recommendation in UI: cron + S3 + encryption at rest + restore test

### 8. Maintenance & Availability
- Settings `maintenance.enabled` → 503 page for public, admin still accessible via token
- `middleware/maintenance` checked each request, bypass if DB down

### 9. CORS & Trust Proxy
- `trust proxy 1` for correct IP behind proxy
- CORS origin via `CORS_ORIGIN` env (comma list), credentials true
- Socket.io CORS same policy

### 10. Production Hardening Checklist
- [x] `npm run build` passes, `NODE_ENV=production node server.js` works (single port)
- [x] `.env` not committed, `.env.example` documents all vars, JWT secret rotated
- [x] `next.config.js` compress + poweredByHeader false + security headers
- [x] `errorHandler` hides 500 details in production
- [x] `lib/db.js` serverSelectionTimeout 5s, socketTimeout 10s, non-blocking connect
- [x] `blockCheck`/`maintenanceCheck` skip if DB not ready or health check
- [x] `helmet` HSTS, CSP, etc.
- [x] Real admin pages for `/security`, `/activity-log`, `/backup` (not stubs)

## How to Verify
```bash
curl -i http://localhost:3000/api/health # headers
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"a@a.com","password":"wrong"}' # 5 times → 429 + IP block
# Check admin:
# /Akramadmin/security  → block/unblock, login logs
# /Akramadmin/activity-log → audit trail
# /Akramadmin/backup → create/list/restore
```

## Remaining Prod Steps for Deployer
1. Set strong `JWT_SECRET` (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
2. Set `MONGODB_URI` with auth + TLS, `CORS_ORIGIN` to real domain
3. Configure Cloudinary real keys
4. Enable HTTPS (nginx/traefik) → HSTS will enforce
5. Add PM2: `pm2 start server.js --name mycompany`
6. Setup cron daily backup + S3 sync + encryption
7. Optionally enable 2FA (field `security.twoFactor` ready) via TOTP lib
