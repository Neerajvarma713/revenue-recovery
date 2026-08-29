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


// --------------------------------------------------
// Find customer by externalId OR MongoDB _id
// --------------------------------------------------

async function findCustomer(id) {
  if (!id) return null;

  // Most of your UI uses externalId such as:
  // Customer 02297
  const byExternalId = await Customer.findOne({
    externalId: id,
  });

  if (byExternalId) {
    return byExternalId;
  }

  // Only query MongoDB _id when it is valid
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    return Customer.findById(id);
  }

  return null;
}


// --------------------------------------------------
// Dashboard
// --------------------------------------------------

export async function dashboard(req, res) {
  try {
    const customers = await Customer.find()
      .select(
        "externalId name planType monthlyRevenue churnProbability riskLevel"
      )
      .lean();

    let totalChurn = 0;
    let totalRevenueRisk = 0;
    let highRisk = 0;

    const riskCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    for (const customer of customers) {
      totalChurn += customer.churnProbability || 0;

      totalRevenueRisk += revenueAtRisk(customer);

      if (
        customer.riskLevel === "HIGH" ||
        customer.riskLevel === "CRITICAL"
      ) {
        highRisk++;
      }

      if (riskCounts[customer.riskLevel] !== undefined) {
        riskCounts[customer.riskLevel]++;
      }
    }

    res.json({
      kpis: {
        customers: customers.length,

        atRisk: totalRevenueRisk,

        highRisk,

        avgChurn: customers.length
          ? totalChurn / customers.length
          : 0,
      },

      riskDistribution: [
        {
          level: "LOW",
          count: riskCounts.LOW,
        },
        {
          level: "MEDIUM",
          count: riskCounts.MEDIUM,
        },
        {
          level: "HIGH",
          count: riskCounts.HIGH,
        },
        {
          level: "CRITICAL",
          count: riskCounts.CRITICAL,
        },
      ],

      customers: customers.slice(0, 8),
    });
  } catch (error) {
    console.error("Dashboard failed:", error);

    res.status(500).json({
      error: "Failed to load dashboard",
    });
  }
}


// --------------------------------------------------
// Get customers
// --------------------------------------------------

export async function customers(req, res) {
  try {
    const q = req.query.q?.trim() || "";

    const filter = q
      ? {
          name: {
            $regex: q,
            $options: "i",
          },
        }
      : {};

    const result = await Customer.find(filter)
      .select(
        "externalId name planType monthlyRevenue churnProbability riskLevel"
      )
      .sort({
        churnProbability: -1,
      })
      .limit(100)
      .lean();

    res.json(result);
  } catch (error) {
    console.error("Customers request failed:", error);

    res.status(500).json({
      error: "Failed to load customers",
    });
  }
}


// --------------------------------------------------
// Create customer
// --------------------------------------------------

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

    const cleanExternalId = externalId?.trim();
    const cleanName = name?.trim();

    // Validate
    if (!cleanExternalId || !cleanName) {
      return res.status(400).json({
        error: "externalId and name are required",
      });
    }

    // Check duplicate
    const existing = await Customer.exists({
      externalId: cleanExternalId,
    });

    if (existing) {
      return res.status(409).json({
        error: "Customer with this externalId already exists",
      });
    }

    // Create customer
    const customer = await Customer.create({
      externalId: cleanExternalId,

      name: cleanName,

      tenureMonths: Number(tenureMonths || 0),

      monthlyRevenue: Number(monthlyRevenue || 0),

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

      churnProbability: 0,

      riskLevel: "LOW",
    });

    // Respond immediately.
    // Audit logging happens after the response.
    res.status(201).json(customer);

    // Do not make the user wait for this.
    AuditLog.create({
      actor: req.user?.email || "system",

      action: "CREATE_CUSTOMER",

      entityType: "Customer",

      entityId: customer.id,

      metadata: {
        externalId: customer.externalId,
        name: customer.name,
      },
    }).catch((error) => {
      console.error(
        "Customer audit log failed:",
        error
      );
    });

  } catch (error) {
    console.error(
      "Create customer failed:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Customer with this externalId already exists",
      });
    }

    res.status(500).json({
      error: "Failed to create customer",
    });
  }
}


// --------------------------------------------------
// Get single customer
// --------------------------------------------------

export async function customer(req, res) {
  try {
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

      revenueAtRisk:
        revenueAtRisk(customer),

      signals: explain(customer),
    });
  } catch (error) {
    console.error(
      "Customer request failed:",
      error
    );

    res.status(500).json({
      error: "Failed to load customer",
    });
  }
}


// --------------------------------------------------
// Score customer
// --------------------------------------------------

export async function score(req, res) {
  try {
    const customer = await findCustomer(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    const prediction =
      await predict(customer);

    customer.churnProbability =
      prediction.churn_probability;

    customer.riskLevel =
      prediction.risk_level;

    await customer.save();

    AuditLog.create({
      actor:
        req.user?.email || "system",

      action: "SCORE_CUSTOMER",

      entityType: "Customer",

      entityId: customer.id,

      metadata: prediction,
    }).catch((error) => {
      console.error(
        "Score audit failed:",
        error
      );
    });

    res.json(prediction);
  } catch (error) {
    console.error(
      "Score customer failed:",
      error
    );

    res.status(500).json({
      error: "Failed to score customer",
    });
  }
}


// --------------------------------------------------
// Interventions
// --------------------------------------------------

export async function interventions(req, res) {
  try {
    const result = await Intervention.find()
      .populate("customer")
      .sort({
        createdAt: -1,
      })
      .limit(100)
      .lean();

    res.json(result);
  } catch (error) {
    console.error(
      "Interventions failed:",
      error
    );

    res.status(500).json({
      error: "Failed to load interventions",
    });
  }
}


// --------------------------------------------------
// Recommend interventions
// --------------------------------------------------

export async function recommend(req, res) {
  try {
    const customer = await findCustomer(
      req.params.id
    );

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    const reason =
      explain(customer).join(", ");

    const rows = strategies(customer)
      .filter(
        (item) => item.netValue > 0
      )
      .sort(
        (a, b) =>
          b.netValue - a.netValue
      );

    if (!rows.length) {
      return res.json([]);
    }

    const created =
      await Intervention.insertMany(
        rows.map((item) => ({
          ...item,

          customer: customer._id,

          reason,
        }))
      );

    res.json(created);
  } catch (error) {
    console.error(
      "Recommendation failed:",
      error
    );

    res.status(500).json({
      error:
        "Failed to recommend interventions",
    });
  }
}


// --------------------------------------------------
// Simulator
// --------------------------------------------------

export async function simulator(req, res) {
  try {
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

    const expectedRevenue =
      customer.monthlyRevenue *
      12 *
      retention;

    res.json({
      cost,

      retention,

      expectedRevenue,

      netValue:
        expectedRevenue - cost,
    });
  } catch (error) {
    console.error(
      "Simulation failed:",
      error
    );

    res.status(500).json({
      error: "Simulation failed",
    });
  }
}


// --------------------------------------------------
// Outcomes
// --------------------------------------------------

export async function outcomes(req, res) {
  try {
    const result = await Outcome.find()
      .populate(
        "customer intervention"
      )
      .sort({
        createdAt: -1,
      })
      .limit(100)
      .lean();

    res.json(result);
  } catch (error) {
    console.error(
      "Outcomes failed:",
      error
    );

    res.status(500).json({
      error: "Failed to load outcomes",
    });
  }
}


// --------------------------------------------------
// Analytics
// --------------------------------------------------

export async function analytics(req, res) {
  try {
    const customers =
      await Customer.find()
        .select(
          "planType monthlyRevenue churnProbability"
        )
        .lean();

    let revenueAtRiskTotal = 0;

    const byPlan = {
      basic: {
        count: 0,
        atRisk: 0,
      },

      standard: {
        count: 0,
        atRisk: 0,
      },

      premium: {
        count: 0,
        atRisk: 0,
      },
    };

    for (const customer of customers) {
      const risk =
        revenueAtRisk(customer);

      revenueAtRiskTotal += risk;

      if (byPlan[customer.planType]) {
        byPlan[customer.planType].count++;

        byPlan[customer.planType].atRisk +=
          risk;
      }
    }

    res.json({
      revenueAtRisk:
        revenueAtRiskTotal,

      byPlan: [
        {
          plan: "basic",
          ...byPlan.basic,
        },

        {
          plan: "standard",
          ...byPlan.standard,
        },

        {
          plan: "premium",
          ...byPlan.premium,
        },
      ],
    });
  } catch (error) {
    console.error(
      "Analytics failed:",
      error
    );

    res.status(500).json({
      error: "Failed to load analytics",
    });
  }
}


// --------------------------------------------------
// Audit
// --------------------------------------------------

export async function audit(req, res) {
  try {
    const result =
      await AuditLog.find()
        .sort({
          createdAt: -1,
        })
        .limit(200)
        .lean();

    res.json(result);
  } catch (error) {
    console.error(
      "Audit failed:",
      error
    );

    res.status(500).json({
      error: "Failed to load audit trail",
    });
  }
}