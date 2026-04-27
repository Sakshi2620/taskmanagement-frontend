# Task Management Frontend (React + Vite)

Modern, responsive task management UI with:
- Add / Edit / Delete tasks
- Search + status filter
- Pagination
- Basic login/logout (frontend-only demo)

This frontend calls the Django REST API.

## Requirements
- Node.js 18+ (recommended 20+)

## Setup
```bash
npm install
```

## Run (local dev)
```bash
npm run dev
```

The app runs on `http://127.0.0.1:5173/`.

## Configure API URL
The frontend reads the API base URL from `VITE_API_URL`.

### Local
Create a `.env` file in this folder:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### Production (Render/Vercel/etc.)
Set an environment variable:
```env
VITE_API_URL=https://<your-backend>.onrender.com/api
```

## Build
```bash
npm run build
```

## Deploy on Render (Static Site)
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist`
- **Environment**: set `VITE_API_URL` to your backend `/api` URL
