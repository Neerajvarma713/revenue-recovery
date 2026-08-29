import mongoose from "mongoose";

const { Schema, model } = mongoose;


// =========================
// Customer
// =========================

const CustomerSchema = new Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    tenureMonths: {
      type: Number,
      default: 0,
    },

    monthlyRevenue: {
      type: Number,
      default: 0,
    },

    supportTickets90d: {
      type: Number,
      default: 0,
    },

    paymentFailures90d: {
      type: Number,
      default: 0,
    },

    usageChangePct: {
      type: Number,
      default: 0,
    },

    nps: {
      type: Number,
      default: 0,
    },

    planType: {
      type: String,
      default: "standard",
    },

    daysSinceLogin: {
      type: Number,
      default: 0,
    },

    discountPct: {
      type: Number,
      default: 0,
    },

    priceIncreasePct: {
      type: Number,
      default: 0,
    },

    engagementTrendPct: {
      type: Number,
      default: 0,
    },

    complaintRecencyDays: {
      type: Number,
      default: 0,
    },

    featureAdoptionPct: {
      type: Number,
      default: 0,
    },

    competitorPressure: {
      type: Number,
      default: 0,
    },

    optedOut: {
      type: Boolean,
      default: false,
    },

    churnProbability: {
      type: Number,
      default: 0,
    },

    riskLevel: {
      type: String,
      default: "LOW",
    },
  },
  {
    timestamps: true,
  }
);


// =========================
// Intervention
// =========================

const InterventionSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    strategy: {
      type: String,
    },

    cost: {
      type: Number,
      default: 0,
    },

    expectedRetention: {
      type: Number,
      default: 0,
    },

    expectedRevenue: {
      type: Number,
      default: 0,
    },

    netValue: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "RECOMMENDED",
    },

    reason: {
      type: String,
    },

    approvedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);


// =========================
// Outcome
// =========================

const OutcomeSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    intervention: {
      type: Schema.Types.ObjectId,
      ref: "Intervention",
    },

    retained: {
      type: Boolean,
      default: false,
    },

    revenueRecovered: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


// =========================
// Audit Log
// =========================

const AuditLogSchema = new Schema(
  {
    actor: {
      type: String,
      default: "system",
    },

    action: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
    },

    entityId: {
      type: String,
    },

    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);


// =========================
// User
// =========================

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    passwordHash: {
      type: String,
    },

    name: {
      type: String,
    },

    role: {
      type: String,
      default: "analyst",
    },
  },
  {
    timestamps: true,
  }
);


// =========================
// Models
// =========================

const Customer = model("Customer", CustomerSchema);

const Intervention = model(
  "Intervention",
  InterventionSchema
);

const Outcome = model(
  "Outcome",
  OutcomeSchema
);

const AuditLog = model(
  "AuditLog",
  AuditLogSchema
);

const User = model(
  "User",
  UserSchema
);


// =========================
// Exports
// =========================

export {
  Customer,
  Intervention,
  Outcome,
  AuditLog,
  User,
};