// =========================
// Revenue At Risk
// =========================

export function revenueAtRisk(customer) {
  const monthlyRevenue = Number(
    customer.monthlyRevenue || 0
  );

  const churnProbability = Number(
    customer.churnProbability || 0
  );

  return Math.max(
    0,
    monthlyRevenue *
      12 *
      churnProbability
  );
}


// =========================
// Explain Risk
// =========================

export function explain(customer) {
  const reasons = [];

  if (
    Number(customer.paymentFailures90d || 0) >= 2
  ) {
    reasons.push(
      "repeated payment failures"
    );
  }

  if (
    Number(customer.usageChangePct || 0) <= -20
  ) {
    reasons.push("usage decline");
  }

  if (
    Number(customer.daysSinceLogin || 0) > 30
  ) {
    reasons.push("long inactivity");
  }

  if (
    Number(customer.supportTickets90d || 0) >= 5
  ) {
    reasons.push(
      "elevated support demand"
    );
  }

  if (
    Number(customer.nps || 0) < 20
  ) {
    reasons.push(
      "low customer sentiment"
    );
  }

  return reasons.length
    ? reasons
    : ["limited negative signals"];
}


// =========================
// Intervention Strategies
// =========================

export function strategies(customer) {
  const base = Number(
    customer.monthlyRevenue || 0
  );

  const strategyList = [
    {
      strategy: "Concierge outreach",
      cost: 25,
      expectedRetention: 0.18,
    },

    {
      strategy: "Targeted credit",
      cost: Math.min(
        base * 0.08,
        75
      ),
      expectedRetention: 0.24,
    },

    {
      strategy: "Plan adjustment",
      cost: Math.min(
        base * 0.05,
        45
      ),
      expectedRetention: 0.16,
    },

    {
      strategy: "Payment recovery",
      cost: 10,
      expectedRetention: 0.21,
    },
  ];

  return strategyList.map(
    (item) => {
      const expectedRevenue =
        base *
        12 *
        item.expectedRetention;

      const netValue =
        expectedRevenue -
        item.cost;

      return {
        strategy: item.strategy,

        cost: item.cost,

        expectedRetention:
          item.expectedRetention,

        expectedRevenue,

        netValue,
      };
    }
  );
}