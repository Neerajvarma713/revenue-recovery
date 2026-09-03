import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import { connectDb } from "./config/db.js";
import { auth } from "./middleware/auth.js";
import { User } from "./models/index.js";
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


function issueToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "8h" }
  );
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  const [salt, storedHash] = storedPassword.split(":");
  if (!salt || !storedHash) return false;

  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  if (storedHash.length !== hash.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

// =========================
// Authentication
// =========================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password || "";
    const name = req.body.name?.trim() || "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const user = await User.create({
      email,
      name,
      passwordHash: hashPassword(password),
    });

    res.status(201).json({ token: issueToken(user) });
  } catch (error) {
    console.error("Sign up failed:", error);
    res.status(500).json({ error: "Unable to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password || "";
    const user = email ? await User.findOne({ email }) : null;

    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({ token: issueToken(user) });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Unable to sign in" });
  }
});

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