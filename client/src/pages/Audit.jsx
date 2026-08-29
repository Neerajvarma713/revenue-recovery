import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Audit() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .audit()
      .then(setRecords)
      .catch((err) => {
        console.error("Audit request failed:", err);
        setError("Unable to load audit trail.");
      });
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="mb-7">
        <div className="mono text-[10px] muted tracking-widest">
          CONTROL LOG
        </div>

        <h1 className="serif text-4xl mt-2">
          Audit trail
        </h1>
      </div>

      {/* Error */}
      {error ? (
        <div className="border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      ) : (
        <div className="bg-white/50 border line divide-y line">
          {records.length ? (
            records.map((item) => (
              <div
                key={item.id ?? `${item.entityType}-${item.entityId}-${item.createdAt}`}
                className="p-4 flex justify-between gap-6"
              >
                <div>
                  <b>{item.action}</b>

                  <div className="mono text-[10px] muted mt-1">
                    {item.entityType} · {item.entityId}
                  </div>
                </div>

                <span className="mono text-[10px] muted whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="p-10 text-center muted">
              No audit events yet.
            </div>
          )}
        </div>
      )}
    </>
  );
}