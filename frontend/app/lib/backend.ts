const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

export const BACKEND_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL
).replace(/\/+$/, "");

export function backendUrl(path: string) {
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_BASE_URL}${normalisedPath}`;
}
