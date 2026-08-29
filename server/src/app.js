import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

import { connectDb } from "./config/db.js";
import { auth } from "./middleware/auth.js";
import * as api from "./controllers/api.js";

const app = express();


// =========================
// Middleware
// =========================

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);

app.use(express.json());


// =========================
// Health Check
// =========================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});


// =========================
// Demo Login
// =========================

app.post("/api/auth/demo", (req, res) => {
  try {
    const token = jwt.sign(
      {
        email:
          req.body.email ||
          "analyst@demo.local",

        role: "analyst",
      },

      process.env.JWT_SECRET ||
        "dev-secret",

      {
        expiresIn: "8h",
      }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login failed:", error);

    res.status(500).json({
      error: "Login failed",
    });
  }
});


// =========================
// Authentication
// =========================

app.use("/api", auth);


// =========================
// Dashboard
// =========================

app.get(
  "/api/dashboard",
  api.dashboard
);


// =========================
// Customers
// =========================

// Get all customers
app.get(
  "/api/customers",
  api.customers
);

// Create customer
app.post(
  "/api/customers",
  api.createCustomer
);

// Get single customer
app.get(
  "/api/customers/:id",
  api.customer
);

// Score customer
app.post(
  "/api/customers/:id/score",
  api.score
);


// =========================
// Interventions
// =========================

app.get(
  "/api/interventions",
  api.interventions
);

app.post(
  "/api/customers/:id/interventions/recommend",
  api.recommend
);


// =========================
// Simulator
// =========================

app.post(
  "/api/customers/:id/simulate",
  api.simulator
);


// =========================
// Outcomes
// =========================

app.get(
  "/api/outcomes",
  api.outcomes
);


// =========================
// Analytics
// =========================

app.get(
  "/api/analytics",
  api.analytics
);


// =========================
// Audit
// =========================

app.get(
  "/api/audit",
  api.audit
);


// =========================
// Start Server
// =========================

const port = process.env.PORT || 4000;

connectDb(
  process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/revenue_recovery"
)
  .then(() => {
    app.listen(port, () => {
      console.log(`API on ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });