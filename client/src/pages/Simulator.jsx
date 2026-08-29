import { useState } from "react";
import { api } from "../services/api";

export default function Simulator() {
  const [customerId, setCustomerId] = useState("");
  const [cost, setCost] = useState(50);
  const [retention, setRetention] = useState(20);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runSimulation = async () => {
    if (!customerId.trim()) {
      setError("Please enter a customer ID.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.simulate(customerId.trim(), {
        cost,
        retention: retention / 100,
      });

      setResult(response);
    } catch (err) {
      console.error("Simulation failed:", err);
      setError(err.message || "Unable to run simulation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-7">
        <div className="mono text-[10px] muted tracking-widest">
          DECISION LAB
        </div>

        <h1 className="serif text-4xl mt-2">
          What-if lab
        </h1>

        <p className="muted mt-2">
          Test an intervention before it enters the action book.
        </p>
      </div>

      {/* Simulator */}
      <div className="max-w-2xl bg-white/50 border line p-7 space-y-5">
        {/* Customer ID */}
        <label className="block text-sm">
          Customer ID

          <input
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="block w-full border line bg-white px-3 py-2 mt-2 outline-none"
            placeholder="MongoDB customer id"
          />
        </label>

        {/* Cost */}
        <label className="block text-sm">
          Intervention cost (${cost})

          <input
            type="range"
            min="0"
            max="300"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            className="w-full mt-3"
          />
        </label>

        {/* Retention */}
        <label className="block text-sm">
          Expected retention ({retention}%)

          <input
            type="range"
            min="0"
            max="100"
            value={retention}
            onChange={(e) => setRetention(Number(e.target.value))}
            className="w-full mt-3"
          />
        </label>

        {/* Error */}
        {error && (
          <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Run */}
        <button
          onClick={runSimulation}
          disabled={loading}
          className="bg-[#193532] text-[#f1eee6] px-5 py-3 text-sm disabled:opacity-50"
        >
          {loading ? "Running…" : "Run simulation"}
        </button>

        {/* Result */}
        {result && (
          <div className="border-t line pt-5 grid grid-cols-2 gap-4">
            <div>
              <div className="mono text-[9px] muted">
                EXPECTED REVENUE
              </div>

              <div className="serif text-2xl">
                ${Number(result.expectedRevenue || 0).toFixed(0)}
              </div>
            </div>

            <div>
              <div className="mono text-[9px] muted">
                NET VALUE
              </div>

              <div className="serif text-2xl">
                ${Number(result.netValue || 0).toFixed(0)}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}