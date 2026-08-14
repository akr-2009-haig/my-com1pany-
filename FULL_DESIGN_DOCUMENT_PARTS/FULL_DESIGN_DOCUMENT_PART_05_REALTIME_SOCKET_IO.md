# 🔌 الجزء 5 — السلوك اللحظي (Socket.io)

- كل CRUD يستدعي `emitEvent(name)` → `io.emit(name)` + `io.emit('content:changed')`.
- **الواجهة العامة:** `RealtimeRefresher` يستمع لـ `content:changed` → `router.refresh()` (بحد 1.2 ثانية).
- **الأحداث:** `slides:updated, stats:updated, sections:updated, services:updated, projects:updated, projectcategories:updated, packages:updated, posts:updated, postcategories:updated, tags:updated, comments:updated, partners:updated, testimonials:updated, team:updated, timeline:updated, certificates:updated, jobs:updated, applications:updated, messages:updated, quotes:updated, packagerequests:updated, faq:updated, menus:updated, banners:updated, pages:updated, users:updated, roles:updated, settings:updated`.

---

