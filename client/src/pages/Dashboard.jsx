import { useEffect, useState } from "react";
import { api } from "../services/api";
import RiskStamp from "../components/RiskStamp";

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((err) => {
        console.error("Dashboard request failed:", err);
        setError("Unable to load dashboard.");
      });
  }, []);

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="muted">Loading desk…</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="mono text-[10px] muted tracking-[.15em] mb-2">
            FRIDAY · 28 AUGUST 2026
          </div>

          <h1 className="serif text-4xl">
            Revenue at risk.
          </h1>

          <p className="muted mt-2">
            A working view of customers most likely to leave — and what is
            worth doing about it.
          </p>
        </div>

        <div className="text-right">
          <div className="mono text-[10px] muted">
            PORTFOLIO AT RISK
          </div>

          <div className="serif text-3xl">
            {money(data.kpis.atRisk)}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          ["Customers", data.kpis.customers],
          ["High-risk", data.kpis.highRisk],
          ["Revenue exposed", money(data.kpis.atRisk)],
          [
            "Avg. churn",
            `${(data.kpis.avgChurn * 100).toFixed(1)}%`,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-[#e4e7de] p-5 shadow-soft"
          >
            <div className="mono text-[9px] muted tracking-wider">
              {label.toUpperCase()}
            </div>

            <div className="serif text-2xl mt-3">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-[1.4fr_.6fr] gap-5">
        {/* Priority Queue */}
        <section className="bg-white/50 border line p-6">
          <div className="flex justify-between mb-5">
            <div>
              <h2 className="serif text-2xl">
                Priority queue
              </h2>

              <p className="text-xs muted mt-1">
                Highest estimated revenue exposure first.
              </p>
            </div>

            <span className="mono text-[10px] muted">
              TOP 8
            </span>
          </div>

          <div className="divide-y line">
            {data.customers.map((customer) => (
              <div
                key={
                  customer._id ??
                  customer.id ??
                  customer.customerId ??
                  customer.name
                }
                className="py-4 flex items-center justify-between gap-5"
              >
                <div>
                  <div className="font-semibold text-sm">
                    {customer.name}
                  </div>

                  <div className="mono text-[10px] muted mt-1">
                    {customer.planType} ·{" "}
                    {money(customer.monthlyRevenue)}/mo ·{" "}
                    {(customer.churnProbability * 100).toFixed(0)}%
                    {" "}probability
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="mono text-[9px] muted">
                      AT RISK
                    </div>

                    <div className="font-semibold text-sm">
                      {money(
                        customer.monthlyRevenue *
                          12 *
                          customer.churnProbability
                      )}
                    </div>
                  </div>

                  <RiskStamp
                    level={customer.riskLevel}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Risk Register */}
        <section className="bg-[#193532] text-[#f1eee6] p-6">
          <div className="mono text-[9px] tracking-wider opacity-60">
            RISK REGISTER
          </div>

          <h2 className="serif text-2xl mt-2 mb-6">
            Portfolio shape
          </h2>

          {data.riskDistribution.map((item) => (
            <div
              key={item.level}
              className="flex items-center justify-between py-3 border-b border-white/10"
            >
              <span className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {item.level}
              </span>

              <span className="mono text-xs">
                {item.count}
              </span>
            </div>
          ))}

          <p className="text-xs opacity-60 leading-5 mt-6">
            Risk is a prioritisation signal, not a verdict. Every
            intervention should clear the expected-value and consent checks.
          </p>
        </section>
      </div>
    </>
  );
}