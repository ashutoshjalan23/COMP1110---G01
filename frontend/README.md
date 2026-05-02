# Open Transit Frontend

This Next.js app is the visual layer for the Smart Public Transport Advisor. Stops, segments, route planning, and live ETAs come from the Python backend.

Production deployment: [https://open-transit-ten.vercel.app](https://open-transit-ten.vercel.app)

## Local development

1. From the repo root, start the backend:

```bash
python backend_api.py
```

2. In this `frontend/` folder, install dependencies and start the frontend:

```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

The frontend calls `/api/backend/...`, which proxies to `http://127.0.0.1:8000` locally.

## Backend connection

The app proxies backend requests to:

1. `BACKEND_URL`, when set on Vercel or in `.env.local`
2. `NEXT_PUBLIC_BACKEND_URL`
3. `http://127.0.0.1:8000` for local development

Production uses `BACKEND_URL=https://open-transit-backend.vercel.app`.
