import { useEffect, useState } from "react";
import { api } from "../services/api";

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function Interventions() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .interventions()
      .then(setRecords)
      .catch((err) => {
        console.error("Interventions request failed:", err);
        setError("Unable to load interventions.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="mb-7">
        <div className="mono text-[10px] muted tracking-widest">
          ACTION BOOK
        </div>

        <h1 className="serif text-4xl mt-2">
          Interventions
        </h1>

        <p className="muted mt-2">
          Recommended actions are evaluated on expected retention value
          before approval.
        </p>
      </div>

      {/* Error */}
      {error ? (
        <div className="border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      ) : loading ? (
        <div className="muted">
          Loading interventions…
        </div>
      ) : (
        <div className="grid gap-3">
          {records.length ? (
            records.map((record) => (
              <div
                key={
                  record._id ??
                  record.id ??
                  `${record.strategy}-${record.netValue}`
                }
                className="bg-white/50 border line p-5 flex justify-between gap-6"
              >
                <div>
                  <div className="font-semibold">
                    {record.strategy}
                  </div>

                  <div className="text-xs muted mt-2">
                    {record.reason}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="mono text-[9px] muted">
                    NET VALUE
                  </div>

                  <div className="serif text-xl">
                    {money(record.netValue)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border line p-10 text-center muted">
              No intervention records yet. Open a customer and run
              recommendations.
            </div>
          )}
        </div>
      )}
    </>
  );
}