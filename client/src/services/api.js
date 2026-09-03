const base =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000/api";


async function req(path, options = {}) {
  const token = localStorage.getItem("rr_token");
  const isAuthRequest = path.startsWith("/auth/");

  const response = await fetch(base + path, {
    ...options,

    headers: {
      ...(options.body
        ? {
            "Content-Type": "application/json",
          }
        : {}),

      ...(token && !isAuthRequest
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },

    signal: options.signal,
  });

  const data = await response
    .json()
    .catch(() => ({}));

  if (response.status === 401) {
    if (isAuthRequest) {
      throw new Error(
        data.error || "Invalid email or password"
      );
    }

    localStorage.removeItem("rr_token");

    if (
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }

    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        `Request failed (${response.status})`
    );
  }

  return data;
}


export const api = {

  // Authentication
  demo: (email) =>
    req("/auth/demo", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  login: (body) =>
    req("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signup: (body) =>
    req("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),


  // Dashboard
  dashboard: (options = {}) =>
    req("/dashboard", options),


  // Customers
  customers: (q = "", options = {}) =>
    req(
      "/customers" +
        (q
          ? `?q=${encodeURIComponent(q)}`
          : ""),
      options
    ),


  createCustomer: (body) =>
    req("/customers", {
      method: "POST",
      body: JSON.stringify(body),
    }),


  customer: (id, options = {}) =>
    req(`/customers/${id}`, options),


  score: (id) =>
    req(`/customers/${id}/score`, {
      method: "POST",
    }),


  // Interventions
  interventions: (options = {}) =>
    req("/interventions", options),


  recommend: (id) =>
    req(
      `/customers/${id}/interventions/recommend`,
      {
        method: "POST",
      }
    ),


  // Simulator
  simulate: (id, body) =>
    req(`/customers/${id}/simulate`, {
      method: "POST",
      body: JSON.stringify(body),
    }),


  // Analytics
  analytics: (options = {}) =>
    req("/analytics", options),


  // Audit
  audit: (options = {}) =>
    req("/audit", options),


  // Outcomes
  outcomes: (options = {}) =>
    req("/outcomes", options),
};