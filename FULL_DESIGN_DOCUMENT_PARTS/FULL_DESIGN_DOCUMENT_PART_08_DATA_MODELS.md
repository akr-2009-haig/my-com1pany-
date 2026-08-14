# 📦 الجزء 8 — نماذج البيانات وعلاقتها بالواجهة (lib/schemas.js)

| الكيان | أبرز الحقول المؤثرة في التصميم |
|---|---|
| users | name, email, username, avatar, role, bio, phone, isActive, twoFactorEnabled |
| roles | name, slug, description, isSystem, permissions |
| slides | title/titleEn, subtitle, image, btn1Text/Link, btn2Text/Link, showBtn2, isActive, order |
| stats | value, label, icon, showPlus, suffix, isActive, order |
| sections | key, label, isVisible, order |
| services | title, slug, shortDesc, description, image, bannerImage, icon, features[], technologies[], seo*, status, isActive, isFeatured, order, views |
| projects | title, slug, category, client, description, challenge, solution, images[], cover, videoUrl, technologies[], liveUrl, projectDate, isActive, isFeatured, views |
| packages | name, description, monthlyPrice, yearlyPrice, currency, features[{text,included}], isPopular, isActive, showOnHome, buttonText, buttonLink, order |
| posts | title, slug, excerpt, content, image, categories[], tags[], authorName, status(published/draft/scheduled), publishAt, readTime, views, isFeatured |
| comments | post, name, email, website, content, status(pending/approved/rejected) |
| partners | name, logo, url, isActive, order |
| testimonials | name, position, company, avatar, content, rating, isActive, order |
| team | name, position, bio, avatar, linkedin, twitter, email, isActive, order |
| timeline | year, title, description, isActive, order |
| certificates | title, image, issuer, isActive, order |
| jobs | title, department, type, location, salaryRange, description, requirements, skills, benefits, deadline, isActive, applicationsCount |
| applications | jobTitle, name, email, phone, coverLetter, resume, portfolioUrl, status(new/reviewing/shortlisted/interview/accepted/rejected) |
| messages | name, email, phone, service, subject, message, status(new/read/replied/archived) |
| quotes | name, company, email, phone, projectType, budget, timeline, description, attachments[], status(new/reviewing/sent/rejected/completed) |
| packagerequests | name, email, phone, company, packageName, billing, message, status |
| faqs | question, answer, category, showOnPricing, isActive, order |
| menus | title, url, location(header/footer), parent, target, isActive, order |
| banners | page, label, title/titleEn, subtitle, image, isActive |
| pages | key, title, content, data |
| settings | كل الإعدادات العامة (company/contact/socials/seo/smtp/whatsapp/languages/security/notifications/maintenance/backup/home) |

---

