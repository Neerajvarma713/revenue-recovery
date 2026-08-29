import { useEffect, useState } from "react";
import { api } from "../services/api";

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .analytics()
      .then(setData)
      .catch((err) => {
        console.error("Analytics request failed:", err);
        setError("Unable to load analytics.");
      });
  }, []);

  if (error) {
    return <div className="text-red-700">{error}</div>;
  }

  if (!data) {
    return <div className="muted">Loading analytics…</div>;
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="mono text-[10px] muted tracking-widest">
          PORTFOLIO ANALYSIS
        </div>

        <h1 className="serif text-4xl mt-2">
          Analytics
        </h1>
      </div>

      {/* Revenue At Risk */}
      <div className="bg-[#193532] text-[#f1eee6] p-7 mb-5">
        <div className="mono text-[9px] opacity-60">
          TOTAL ESTIMATED REVENUE AT RISK
        </div>

        <div className="serif text-4xl mt-2">
          {money(data.revenueAtRisk)}
        </div>
      </div>

      {/* By Plan */}
      <div className="bg-white/50 border line p-6">
        <h2 className="serif text-2xl mb-5">
          By plan
        </h2>

        {data.byPlan.map((item) => (
          <div
            key={item.plan}
            className="grid grid-cols-3 py-4 border-b line"
          >
            <span className="font-semibold capitalize">
              {item.plan}
            </span>

            <span className="mono text-xs">
              {item.count} customers
            </span>

            <span className="text-right">
              {money(item.atRisk)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}