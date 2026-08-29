import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Interventions from "./pages/Interventions";
import Simulator from "./pages/Simulator";
import Analytics from "./pages/Analytics";
import Audit from "./pages/Audit";

function ProtectedRoute() {
  const token = localStorage.getItem("rr_token");

  return token ? (
    <Layout />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected application */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/interventions"
            element={<Interventions />}
          />

          <Route
            path="/simulator"
            element={<Simulator />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/audit"
            element={<Audit />}
          />
        </Route>

        {/* Invalid URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}