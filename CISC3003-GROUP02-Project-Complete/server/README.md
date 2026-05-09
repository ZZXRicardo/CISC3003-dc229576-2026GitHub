# Backend

This backend is now organized by feature so future development is easier to extend.

## Folder structure

```text
Backend/
|- app/
|  |- server.js
|- ai/
|  |- chat.route.js
|- auth/
|  |- auth.route.js
|  |- auth.middleware.js
|  |- rate-limit.js
|  |- tokens.js
|  |- mailer.js
|  |- email-logs.js
|- content/
|  |- programmes.route.js
|  |- jobs.route.js
|- database/
|  |- db.js
|  |- content-admin.route.js
|  |- seed/
|     |- programmes.seed.json
|     |- jobs.seed.json
|- user/
|  |- shortlist.route.js
|  |- history.route.js
|- .env.example
|- index.js
|- package.json
```

## Functional areas

- `ai/`: AI chat route and future model integrations
- `auth/`: signup, login, verification, reset password, mail sending, auth middleware
- `content/`: public content APIs such as programmes and jobs
- `database/`: database initialization, seed data, and future content intake APIs
- `user/`: user-specific shortlist and history features

## Database content intake

Reserved APIs for future school and programme entry:

- `GET /api/database/schema`
- `GET /api/database/schools`
- `GET /api/database/school-programmes`
- `POST /api/database/intake/schools`
- `POST /api/database/intake/programmes`

These endpoints are intended to help you add future school and programme content without redesigning the backend later.

## Run

1. Create `.env` from `.env.example`
2. Run `npm install`
3. Run `npm start`

## Gmail App Password

```env
EMAIL_PROVIDER=gmail
SMTP_USER=yourname@gmail.com
SMTP_PASS=your-16-digit-app-password
MAIL_FROM=Your Name <yourname@gmail.com>
```

## AI Chat

```env
DASHSCOPE_API_KEY=your-dashscope-api-key
AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
```
