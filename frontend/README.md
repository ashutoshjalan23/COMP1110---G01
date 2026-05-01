# Open Transit Frontend

This Next.js app is the visual layer for the Smart Public Transport Advisor. It does not contain the route engine anymore. Stops, segments, route planning, and live ETAs all come from the Python backend in the repo root. The package and Vercel project name are `open-transit`; the old `spline-ui` name is not used.

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

The frontend uses `NEXT_PUBLIC_BACKEND_URL` if it is set. Otherwise it defaults to `http://127.0.0.1:8000`.
