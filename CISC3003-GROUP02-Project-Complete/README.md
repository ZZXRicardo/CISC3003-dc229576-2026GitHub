# CISC3003-GROUP02-Project-Complete

This folder is the merged full-stack project assembled from the separate `frontend` and `Backend` folders.

## Structure

- `public/`: static frontend pages, CSS, and browser JavaScript
- `server/`: Node.js + Express backend, SQLite database, auth, email, and AI chat

## Quick start

From this folder:

```powershell
Copy-Item server\.env.example server\.env
npm run install:server
npm run dev
```

Then open `http://localhost:3000`.

## Available scripts

- `npm run install:server`: install backend dependencies
- `npm start`: start the backend server
- `npm run dev`: start the backend in development mode with nodemon

## Environment

Edit `server/.env` after copying from `server/.env.example`.

Important variables:

- `SESSION_SECRET`: session signing secret
- `EMAIL_PROVIDER`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`: email sending
- `DASHSCOPE_API_KEY`: AI chat API key
- `AI_BASE_URL`, `QWEN_MODEL`: AI chat provider settings
