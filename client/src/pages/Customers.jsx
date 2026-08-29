import { useEffect, useState } from "react";
import { api } from "../services/api";
import RiskStamp from "../components/RiskStamp";

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function Customers() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  const loadCustomers = () => {
    setError("");

    api
      .customers(query)
      .then(setRows)
      .catch((err) => {
        console.error("Customers request failed:", err);
        setError("Unable to load customers.");
        setRows([]);
      });
  };

  useEffect(() => {
    loadCustomers();
  }, [query]);

  return (
    <>
      {/* Page Header */}
      <div className="mb-7">
        <div className="mono text-[10px] muted tracking-widest">
          CUSTOMER LEDGER
        </div>

        <h1 className="serif text-4xl mt-2">
          Customers
        </h1>
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search customer name…"
        className="w-full bg-white/50 border line px-4 py-3 outline-none mb-4 text-sm"
      />

      {/* Error */}
      {error ? (
        <div className="border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      ) : (
        <div className="bg-white/50 border line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="mono text-[9px] muted text-left border-b line">
              <tr>
                <th className="p-4">CUSTOMER</th>
                <th>PLAN</th>
                <th>MONTHLY</th>
                <th>CHURN</th>
                <th>RISK</th>
              </tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map((customer) => (
                  <tr
                    key={customer.id ?? customer.customerId ?? customer.name}
                    className="border-b line last:border-0"
                  >
                    <td className="p-4 font-semibold">
                      {customer.name}
                    </td>

                    <td>
                      {customer.planType}
                    </td>

                    <td>
                      {money(customer.monthlyRevenue)}
                    </td>

                    <td className="mono text-xs">
                      {((customer.churnProbability || 0) * 100).toFixed(0)}%
                    </td>

                    <td>
                      <RiskStamp level={customer.riskLevel} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center muted"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}