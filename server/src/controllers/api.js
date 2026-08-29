import {
  Customer,
  Intervention,
  Outcome,
  AuditLog,
} from "../models/index.js";

import {
  revenueAtRisk,
  explain,
  strategies,
} from "../services/risk.js";

import { predict } from "../services/ml.js";

export async function dashboard(req, res) {
  const customers = await Customer.find();

  const totalChurn = customers.reduce(
    (sum, customer) => sum + (customer.churnProbability || 0),
    0
  );

  const revenueRisk = customers.map((customer) =>
    revenueAtRisk(customer)
  );

  res.json({
    kpis: {
      customers: customers.length,
      atRisk: revenueRisk.reduce((sum, value) => sum + value, 0),
      highRisk: customers.filter((customer) =>
        ["HIGH", "CRITICAL"].includes(customer.riskLevel)
      ).length,
      avgChurn: customers.length
        ? totalChurn / customers.length
        : 0,
    },

    riskDistribution: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(
      (level) => ({
        level,
        count: customers.filter(
          (customer) => customer.riskLevel === level
        ).length,
      })
    ),

    customers: customers.slice(0, 8),
  });
}

export async function customers(req, res) {
  const q = req.query.q || "";

  const filter = q
    ? {
        name: {
          $regex: q,
          $options: "i",
        },
      }
    : {};

  const result = await Customer.find(filter).sort({
    churnProbability: -1,
  });

  res.json(result);
}

export async function customer(req, res) {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found",
    });
  }

  res.json({
    ...customer.toObject(),
    revenueAtRisk: revenueAtRisk(customer),
    signals: explain(customer),
  });
}

export async function score(req, res) {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found",
    });
  }

  const prediction = await predict(customer);

  customer.churnProbability = prediction.churn_probability;
  customer.riskLevel = prediction.risk_level;

  await customer.save();

  await AuditLog.create({
    actor: req.user?.email || "system",
    action: "SCORE_CUSTOMER",
    entityType: "Customer",
    entityId: customer.id,
    metadata: prediction,
  });

  res.json(prediction);
}

export async function interventions(req, res) {
  const result = await Intervention.find()
    .populate("customer")
    .sort({ createdAt: -1 });

  res.json(result);
}

export async function recommend(req, res) {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found",
    });
  }

  const rows = strategies(customer)
    .filter((item) => item.netValue > 0)
    .sort((a, b) => b.netValue - a.netValue);

  const created = await Intervention.insertMany(
    rows.map((item) => ({
      ...item,
      customer: customer._id,
      reason: explain(customer).join(", "),
    }))
  );

  res.json(created);
}

export async function simulator(req, res) {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found",
    });
  }

  const cost = Number(req.body.cost || 0);
  const retention = Number(req.body.retention || 0);

  res.json({
    cost,
    retention,
    expectedRevenue:
      customer.monthlyRevenue * 12 * retention,
    netValue:
      customer.monthlyRevenue * 12 * retention - cost,
  });
}

export async function outcomes(req, res) {
  const result = await Outcome.find()
    .populate("customer intervention")
    .sort({ createdAt: -1 });

  res.json(result);
}

export async function analytics(req, res) {
  const customers = await Customer.find();

  res.json({
    revenueAtRisk: customers.reduce(
      (sum, customer) =>
        sum + revenueAtRisk(customer),
      0
    ),

    byPlan: ["basic", "standard", "premium"].map(
      (plan) => ({
        plan,

        count: customers.filter(
          (customer) => customer.planType === plan
        ).length,

        atRisk: customers
          .filter(
            (customer) => customer.planType === plan
          )
          .reduce(
            (sum, customer) =>
              sum + revenueAtRisk(customer),
            0
          ),
      })
    ),
  });
}

export async function audit(req, res) {
  const result = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(result);
}