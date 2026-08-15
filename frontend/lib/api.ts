/**
 * Thin fetch wrapper around the real MedTrace AI backend. No mocked data —
 * every call hits FastAPI. Token is kept in localStorage for simplicity.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("medtrace_token");
}

export function setToken(token: string) {
  localStorage.setItem("medtrace_token", token);
}

export function clearToken() {
  localStorage.removeItem("medtrace_token");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (body: any) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: any) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/patients/me"),

  listDocuments: () => request("/documents"),
  uploadDocument: (formData: FormData) => request("/documents/upload", { method: "POST", body: formData }),
  processDocument: (id: string) => request(`/documents/${id}/process`, { method: "POST" }),
  deleteDocument: (id: string) => request(`/documents/${id}`, { method: "DELETE" }),

  timeline: () => request("/timeline"),
  conditions: () => request("/conditions"),
  treatments: () => request("/treatments"),
  medications: () => request("/medications"),
  labResults: () => request("/lab-results"),

  search: (query: string) => request("/search", { method: "POST", body: JSON.stringify({ query, top_k: 5 }) }),
  chat: (message: string, session_id?: string) =>
    request("/assistant/chat", { method: "POST", body: JSON.stringify({ message, session_id }) }),
};
