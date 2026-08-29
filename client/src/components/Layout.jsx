import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FlaskConical,
  BarChart3,
  ScrollText,
  Settings,
} from "lucide-react";
import { useEffect } from "react";
import { api } from "../services/api";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/interventions", label: "Interventions", icon: ArrowLeftRight },
  { to: "/simulator", label: "What-if lab", icon: FlaskConical },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/audit", label: "Audit trail", icon: ScrollText },
];

export default function Layout() {
  useEffect(() => {
    const token = localStorage.getItem("rr_token");

    if (!token) {
      api
        .demo("analyst@demo.local")
        .then((response) => {
          localStorage.setItem("rr_token", response.token);
        })
        .catch((error) => {
          console.error("Demo login failed:", error);
        });
    }
  }, []);

  return (
    <div className="min-h-screen flex paper">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r line px-5 py-7 flex flex-col min-h-screen">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 bg-[#193532] text-[#f1eee6] grid place-items-center serif text-lg">
            R
          </div>

          <div>
            <div className="serif text-xl leading-none">
              Recovery
            </div>

            <div className="mono text-[9px] tracking-[.18em] muted mt-1">
              REVENUE DESK
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3",
                  "px-3 py-2.5",
                  "text-sm rounded-sm",
                  "transition-colors",
                  isActive
                    ? "bg-[#dfe5db] ink font-semibold"
                    : "muted hover:ink hover:bg-[#eef1eb]",
                ].join(" ")
              }
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Workspace Settings */}
        <div className="mt-auto pt-6">
          <div className="border-t line pt-4">
            <div className="flex items-center gap-3 muted text-xs">
              <Settings size={15} strokeWidth={1.8} />
              <span>Workspace settings</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 shrink-0 border-b line flex items-center justify-between px-8">
          <div className="mono text-[10px] muted tracking-[.12em]">
            OPERATIONS / CUSTOMER RETENTION
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Model service online</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}