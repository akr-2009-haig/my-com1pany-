# MyCompany - Full-Stack Web App

Production-ready full-stack app per **general design** spec.

## Stack
- **Frontend**: Next.js 14 App Router + Tailwind CSS (`#00BCD4` primary, `#FFFFFF` bg, RTL/LTR)
- **Backend**: Node.js + Express + Socket.io on **single server** via `server.js` (Next + Express + Socket.io on same PORT)
- **DB**: MongoDB (Mongoose)
- **Auth**: JWT (`middleware/auth.js`)
- **Media**: Multer + Cloudinary (`lib/cloudinary.js`, `middleware/upload.js`)
- **Realtime**: `events/emitEvent.js` called from every controller after CRUD → `io.emit(event)`; `hooks/useRealtime.js` + `context/SocketContext.jsx` update UI without reload
- **State**: Zustand stores

## Quick Start
```bash
cd my-app
cp .env.example .env   # edit MONGODB_URI, JWT_SECRET, CLOUDINARY_*
npm install --legacy-peer-deps
npm run build
npm start              # production: NODE_ENV=production node server.js
# dev:
npm run dev
```

## Env
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mycompany
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Auth Admin
- Register first admin: `POST /api/auth/register {name,email,password}`
- Login: `POST /api/auth/login` → `{token,user}`
- Protected routes use `Authorization: Bearer <token>`
- Admin UI at `/Akramadmin/login` (default demo `admin@company.com / admin123` after register)

## Socket Events
All names in `utils/socketEvents.js`:
`slides:updated, services:updated, projects:updated, packages:updated, posts:updated, partners:updated, testimonials:updated, stats:updated, settings:updated, sections:updated, team:updated, timeline:updated, jobs:updated, faq:updated, menus:updated, banners:updated`

## Admin Features (per design)
- Toggle إظهار/إخفاء for every section (PageSection `isVisible`, plus each model `isActive`)
- Drag & Drop ordering (`order` field, `/api/sections/reorder`)
- Dynamic lists, image upload, WYSIWYG, icon/color pickers
- Full CRUD for 23 models + users/roles/activity-log/security/backup
- Banners per page, menus (header/footer nested), settings (company, contact, social, SEO, SMTP, whatsapp, languages, security, maintenance)

## Production
- `server.js` serves Next + Express + Socket.io on single PORT, helmet, cors, rate-limit ready, errorHandler
- `next.config.js` images remotePatterns, `tailwind.config.js` with primary colors, `postcss.config.js`
- Build verified: `next build` passes (67 pages)

## File Structure
Matches exact spec in prompt: `server.js`, `lib/`, `middleware/`, `models/`, `routes/`, `controllers/`, `events/`, `app/` (incl. `Akramadmin/*`), `components/` (layout/home/shared/admin), `context/`, `hooks/`, `store/`, `utils/`.

## Testing Realtime
1. Open `/` in two browsers
2. In `/Akramadmin` change a slide or toggle a section
3. Observe instant update via Socket.io without reload
