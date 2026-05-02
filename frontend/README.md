# Open Transit Frontend

This Next.js app is the visual layer for the Smart Public Transport Advisor. It does not contain the route engine anymore. Stops, segments, route planning, and live ETAs all come from the Python backend. The canonical backend repo is [OpenTransit-backend](https://github.com/ashutoshjalan23/OpenTransit-backend). The package and Vercel project name are `open-transit`; the old `spline-ui` name is not used.

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

By default, the frontend calls its own `/api/backend/...` proxy, which forwards to the Python backend. With no environment variables set, that proxy targets `http://127.0.0.1:8000` for local development.

## Backend connection

The app calls `/api/backend/...` by default. That Next.js route proxies requests to:

1. `BACKEND_URL`, when set on Vercel or in `.env.local`
2. `NEXT_PUBLIC_BACKEND_URL`, if a direct browser-facing backend override is needed
3. `http://127.0.0.1:8000` for local development

For production, set `BACKEND_URL` in Vercel to `https://open-transit-backend.vercel.app`.
