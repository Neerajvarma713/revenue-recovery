export function revenueAtRisk(customer) {
  return Math.max(
    0,
    Number(customer.monthlyRevenue || 0) *
      12 *
      Number(customer.churnProbability || 0)
  );
}

export function explain(customer) {
  const reasons = [];

  if (customer.paymentFailures90d >= 2) {
    reasons.push("repeated payment failures");
  }

  if (customer.usageChangePct <= -20) {
    reasons.push("usage decline");
  }

  if (customer.daysSinceLogin > 30) {
    reasons.push("long inactivity");
  }

  if (customer.supportTickets90d >= 5) {
    reasons.push("elevated support demand");
  }

  if (customer.nps < 20) {
    reasons.push("low customer sentiment");
  }

  return reasons.length
    ? reasons
    : ["limited negative signals"];
}

export function strategies(customer) {
  const base = Number(customer.monthlyRevenue || 0);

  const strategies = [
    {
      name: "Concierge outreach",
      cost: 25,
      retention: 0.18,
    },
    {
      name: "Targeted credit",
      cost: Math.min(base * 0.08, 75),
      retention: 0.24,
    },
    {
      name: "Plan adjustment",
      cost: Math.min(base * 0.05, 45),
      retention: 0.16,
    },
    {
      name: "Payment recovery",
      cost: 10,
      retention: 0.21,
    },
  ];

  return strategies.map((strategy) => ({
    ...strategy,
    expectedRevenue:
      base * 12 * strategy.retention,
    netValue:
      base * 12 * strategy.retention -
      strategy.cost,
  }));
}