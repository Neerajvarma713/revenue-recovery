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


// Find customer using either MongoDB _id or externalId
async function findCustomer(id) {
  const byExternalId = await Customer.findOne({
    externalId: id,
  });

  if (byExternalId) {
    return byExternalId;
  }

  // Only try _id if it looks like a valid MongoDB ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    return Customer.findById(id);
  }

  return null;
}


// Dashboard
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

      atRisk: revenueRisk.reduce(
        (sum, value) => sum + value,
        0
      ),

      highRisk: customers.filter((customer) =>
        ["HIGH", "CRITICAL"].includes(customer.riskLevel)
      ).length,

      avgChurn: customers.length
        ? totalChurn / customers.length
        : 0,
    },

    riskDistribution: [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ].map((level) => ({
      level,

      count: customers.filter(
        (customer) => customer.riskLevel === level
      ).length,
    })),

    customers: customers.slice(0, 8),
  });
}


// Get customers
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


// Create new customer
export async function createCustomer(req, res) {
  try {
    const {
      externalId,
      name,
      tenureMonths,
      monthlyRevenue,
      supportTickets90d,
      paymentFailures90d,
      usageChangePct,
      nps,
      planType,
      daysSinceLogin,
      discountPct,
    } = req.body;

    // Required fields
    if (!externalId || !name) {
      return res.status(400).json({
        error: "externalId and name are required",
      });
    }

    // Check for duplicate external ID
    const existing = await Customer.findOne({
      externalId,
    });

    if (existing) {
      return res.status(409).json({
        error: "Customer with this externalId already exists",
      });
    }

    const customer = await Customer.create({
      externalId,
      name,

      tenureMonths: Number(tenureMonths || 0),

      monthlyRevenue: Number(
        monthlyRevenue || 0
      ),

      supportTickets90d: Number(
        supportTickets90d || 0
      ),

      paymentFailures90d: Number(
        paymentFailures90d || 0
      ),

      usageChangePct: Number(
        usageChangePct || 0
      ),

      nps: Number(nps || 0),

      planType: planType || "standard",

      daysSinceLogin: Number(
        daysSinceLogin || 0
      ),

      discountPct: Number(
        discountPct || 0
      ),

      // Initial values before ML scoring
      churnProbability: 0,
      riskLevel: "LOW",
    });

    // Add audit log
    await AuditLog.create({
      actor: req.user?.email || "system",

      action: "CREATE_CUSTOMER",

      entityType: "Customer",

      entityId: customer.id,

      metadata: {
        externalId: customer.externalId,
        name: customer.name,
      },
    });

    res.status(201).json(customer);

  } catch (error) {
    console.error(
      "Create customer failed:",
      error
    );

    res.status(500).json({
      error: "Failed to create customer",
    });
  }
}


// Get single customer
export async function customer(req, res) {
  const customer = await findCustomer(
    req.params.id
  );

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


// Score customer
export async function score(req, res) {
  const customer = await findCustomer(
    req.params.id
  );

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found",
    });
  }

  const prediction = await predict(customer);

  customer.churnProbability =
    prediction.churn_probability;

  customer.riskLevel =
    prediction.risk_level;

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


// Interventions
export async function interventions(req, res) {
  const result = await Intervention.find()
    .populate("customer")
    .sort({ createdAt: -1 });

  res.json(result);
}


// Recommend interventions
export async function recommend(req, res) {
  const customer = await findCustomer(
    req.params.id
  );

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found",
    });
  }

  const rows = strategies(customer)
    .filter((item) => item.netValue > 0)
    .sort(
      (a, b) => b.netValue - a.netValue
    );

  const created = await Intervention.insertMany(
    rows.map((item) => ({
      ...item,

      customer: customer._id,

      reason: explain(customer).join(", "),
    }))
  );

  res.json(created);
}


// Simulator
export async function simulator(req, res) {
  const customer = await findCustomer(
    req.params.id
  );

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found",
    });
  }

  const cost = Number(
    req.body.cost || 0
  );

  const retention = Number(
    req.body.retention || 0
  );

  res.json({
    cost,

    retention,

    expectedRevenue:
      customer.monthlyRevenue *
      12 *
      retention,

    netValue:
      customer.monthlyRevenue *
        12 *
        retention -
      cost,
  });
}


// Outcomes
export async function outcomes(req, res) {
  const result = await Outcome.find()
    .populate("customer intervention")
    .sort({ createdAt: -1 });

  res.json(result);
}


// Analytics
export async function analytics(req, res) {
  const customers = await Customer.find();

  res.json({
    revenueAtRisk: customers.reduce(
      (sum, customer) =>
        sum + revenueAtRisk(customer),
      0
    ),

    byPlan: [
      "basic",
      "standard",
      "premium",
    ].map((plan) => ({
      plan,

      count: customers.filter(
        (customer) =>
          customer.planType === plan
      ).length,

      atRisk: customers
        .filter(
          (customer) =>
            customer.planType === plan
        )
        .reduce(
          (sum, customer) =>
            sum + revenueAtRisk(customer),
          0
        ),
    })),
  });
}


// Audit
export async function audit(req, res) {
  const result = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(result);
}