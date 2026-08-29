import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDb } from "./config/db.js";
import { auth } from "./middleware/auth.js";
import * as api from "./controllers/api.js";

const app = express();


// Middleware
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);

app.use(express.json());


// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});


// Demo Authentication
app.post("/api/auth/demo", (req, res) => {
  import("jsonwebtoken").then(({ default: jwt }) => {
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
  });
});


// Authentication Middleware
app.use("/api", auth);


// API Routes
app.get(
  "/api/dashboard",
  api.dashboard
);

app.get(
  "/api/customers",
  api.customers
);

app.get(
  "/api/customers/:id",
  api.customer
);

app.post(
  "/api/customers/:id/score",
  api.score
);

app.get(
  "/api/interventions",
  api.interventions
);

app.post(
  "/api/customers/:id/interventions/recommend",
  api.recommend
);

app.post(
  "/api/customers/:id/simulate",
  api.simulator
);

app.get(
  "/api/outcomes",
  api.outcomes
);

app.get(
  "/api/analytics",
  api.analytics
);

app.get(
  "/api/audit",
  api.audit
);


// Start Server
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
    console.error(error);
    process.exit(1);
  });