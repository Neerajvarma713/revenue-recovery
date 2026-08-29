export async function predict(customer) {
  const base =
    process.env.ML_URL || "http://127.0.0.1:8000";

  const response = await fetch(`${base}/predict`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      tenure_months: customer.tenureMonths,
      monthly_revenue: customer.monthlyRevenue,
      support_tickets_90d: customer.supportTickets90d,
      payment_failures_90d: customer.paymentFailures90d,
      usage_change_pct: customer.usageChangePct,
      nps: customer.nps,
      plan_type: customer.planType,
      days_since_login: customer.daysSinceLogin,
      discount_pct: customer.discountPct,
      opted_out: customer.optedOut,
    }),
  });

  if (!response.ok) {
    throw new Error("ML service unavailable");
  }

  return response.json();
}