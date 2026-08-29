import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CustomerSchema = new Schema({
  externalId: String,
  name: String,
  email: String,
  tenureMonths: Number,
  monthlyRevenue: Number,
  supportTickets90d: Number,
  paymentFailures90d: Number,
  usageChangePct: Number,
  nps: Number,
  planType: String,
  daysSinceLogin: Number,
  discountPct: Number,
  priceIncreasePct: Number,
  engagementTrendPct: Number,
  complaintRecencyDays: Number,
  featureAdoptionPct: Number,
  competitorPressure: Number,
  optedOut: {
    type: Boolean,
    default: false
  },
  churnProbability: Number,
  riskLevel: String
}, { timestamps: true });

const InterventionSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  },
  strategy: String,
  cost: Number,
  expectedRetention: Number,
  expectedRevenue: Number,
  netValue: Number,
  status: {
    type: String,
    default: 'RECOMMENDED'
  },
  reason: String,
  approvedBy: String
}, { timestamps: true });

const OutcomeSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  },
  intervention: {
    type: Schema.Types.ObjectId,
    ref: 'Intervention'
  },
  retained: Boolean,
  revenueRecovered: Number
}, { timestamps: true });

const AuditLogSchema = new Schema({
  actor: String,
  action: String,
  entityType: String,
  entityId: String,
  metadata: Schema.Types.Mixed
}, { timestamps: true });

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true
  },
  passwordHash: String,
  name: String,
  role: {
    type: String,
    default: 'analyst'
  }
});

const Customer = model('Customer', CustomerSchema);
const Intervention = model('Intervention', InterventionSchema);
const Outcome = model('Outcome', OutcomeSchema);
const AuditLog = model('AuditLog', AuditLogSchema);
const User = model('User', UserSchema);

export {
  Customer,
  Intervention,
  Outcome,
  AuditLog,
  User
};