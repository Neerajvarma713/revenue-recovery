import "dotenv/config";
import fs from "fs";

import { connectDb } from "./config/db.js";
import { Customer } from "./models/index.js";


// Read CSV
const csv = fs
  .readFileSync("../ml-service/data/customers.csv", "utf8")
  .trim()
  .split("\n")
  .slice(1)
  .map((line) => {
    const parts = line.split(",");

    return {
      externalId: parts[0],
      name: parts[1],

      tenureMonths: +parts[2],
      monthlyRevenue: +parts[3],

      supportTickets90d: +parts[4],
      paymentFailures90d: +parts[5],

      usageChangePct: +parts[6],
      nps: +parts[7],

      planType: parts[8],

      daysSinceLogin: +parts[9],
      discountPct: +parts[10],

      churnProbability: +parts[11] * 0.9,
      riskLevel: +parts[11] ? "HIGH" : "LOW",
    };
  });


// Connect to MongoDB
await connectDb(
  process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/revenue_recovery"
);


// Clear existing customers
await Customer.deleteMany({});


// Insert customers
await Customer.insertMany(csv);

console.log(`Seeded ${csv.length}`);

process.exit();