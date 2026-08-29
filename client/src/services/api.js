const base =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function req(path, options = {}) {
  const token = localStorage.getItem("rr_token");

  const response = await fetch(base + path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed (${response.status})`
    );
  }

  return data;
}

export const api = {
  demo: (email) =>
    req("/auth/demo", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  dashboard: () => req("/dashboard"),

  customers: (q) =>
    req(
      "/customers" +
        (q ? `?q=${encodeURIComponent(q)}` : "")
    ),

  customer: (id) =>
    req(`/customers/${id}`),

  score: (id) =>
    req(`/customers/${id}/score`, {
      method: "POST",
    }),

  interventions: () =>
    req("/interventions"),

  recommend: (id) =>
    req(`/customers/${id}/interventions/recommend`, {
      method: "POST",
    }),

  simulate: (id, body) =>
    req(`/customers/${id}/simulate`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  analytics: () =>
    req("/analytics"),

  audit: () =>
    req("/audit"),

  outcomes: () =>
    req("/outcomes"),
};