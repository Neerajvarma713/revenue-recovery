export default function RiskStamp({ level = "LOW" }) {
  const riskColors = {
    CRITICAL: "text-red-800",
    HIGH: "text-orange-800",
    MEDIUM: "text-amber-700",
    LOW: "text-emerald-800",
  };

  const colorClass = riskColors[level] || "text-slate-700";

  return (
    <span className={`stamp ${colorClass}`}>
      {level}
    </span>
  );
}