import {
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "../services/api";
import RiskStamp from "../components/RiskStamp";

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);


const emptyForm = {
  externalId: "",
  name: "",
  tenureMonths: "",
  monthlyRevenue: "",
  supportTickets90d: "",
  paymentFailures90d: "",
  usageChangePct: "",
  nps: "",
  planType: "standard",
  daysSinceLogin: "",
  discountPct: "",
};


export default function Customers() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [showAdd, setShowAdd] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const abortRef = useRef(null);


  async function loadCustomers(
    search = query
  ) {
    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller =
      new AbortController();

    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const data = await api.customers(
        search,
        {
          signal: controller.signal,
        }
      );

      setRows(data);

    } catch (err) {

      // Ignore aborted requests
      if (
        err.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Customers request failed:",
        err
      );

      setError(
        "Unable to load customers."
      );

      setRows([]);

    } finally {

      if (
        !controller.signal.aborted
      ) {
        setLoading(false);
      }
    }
  }


  // Initial load only
  useEffect(() => {
    loadCustomers("");

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);


  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {

      loadCustomers(query);

    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);


  function updateField(
    e
  ) {
    const { name, value } =
      e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  async function handleCreate(
    e
  ) {
    e.preventDefault();

    setFormError("");
    setSaving(true);

    try {

      await api.createCustomer({
        ...form,

        tenureMonths:
          Number(
            form.tenureMonths || 0
          ),

        monthlyRevenue:
          Number(
            form.monthlyRevenue || 0
          ),

        supportTickets90d:
          Number(
            form.supportTickets90d || 0
          ),

        paymentFailures90d:
          Number(
            form.paymentFailures90d || 0
          ),

        usageChangePct:
          Number(
            form.usageChangePct || 0
          ),

        nps:
          Number(form.nps || 0),

        daysSinceLogin:
          Number(
            form.daysSinceLogin || 0
          ),

        discountPct:
          Number(
            form.discountPct || 0
          ),
      });


      // Close immediately after success
      setShowAdd(false);

      setForm(emptyForm);

      // Refresh customer list once
      await loadCustomers(query);

    } catch (err) {

      console.error(
        "Create customer failed:",
        err
      );

      setFormError(
        err.message ||
          "Failed to create customer."
      );

    } finally {
      setSaving(false);
    }
  }


  return (
    <>

      {/* Header */}
      <div className="mb-7 flex items-end justify-between">

        <div>
          <div className="mono text-[10px] muted tracking-widest">
            CUSTOMER LEDGER
          </div>

          <h1 className="serif text-4xl mt-2">
            Customers
          </h1>
        </div>


        <button
          onClick={() => {
            setFormError("");
            setForm(emptyForm);
            setShowAdd(true);
          }}
          className="bg-[#193532] text-[#f1eee6] px-5 py-3 text-sm"
        >
          + Add customer
        </button>

      </div>


      {/* Search */}
      <input
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
        placeholder="Search customer name…"
        className="w-full bg-white/50 border line px-4 py-3 outline-none mb-4 text-sm"
      />


      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 p-5 text-red-700 mb-4">
          {error}
        </div>
      )}


      {/* Table */}
      <div className="bg-white/50 border line overflow-hidden">

        <table className="w-full text-sm">

          <thead className="mono text-[9px] muted text-left border-b line">

            <tr>
              <th className="p-4">
                CUSTOMER
              </th>

              <th>
                PLAN
              </th>

              <th>
                MONTHLY
              </th>

              <th>
                CHURN
              </th>

              <th>
                RISK
              </th>
            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="5"
                  className="p-10 text-center muted"
                >
                  Loading customers...
                </td>
              </tr>

            ) : rows.length ? (

              rows.map(
                (customer) => (

                  <tr
                    key={
                      customer._id ||
                      customer.externalId
                    }
                    className="border-b line last:border-0"
                  >

                    <td className="p-4">

                      <div className="font-semibold">
                        {customer.name}
                      </div>

                      <div className="mono text-[9px] muted mt-1">
                        {customer.externalId}
                      </div>

                    </td>


                    <td>
                      {customer.planType}
                    </td>


                    <td>
                      {money(
                        customer.monthlyRevenue
                      )}
                    </td>


                    <td className="mono text-xs">
                      {(
                        (customer.churnProbability ||
                          0) *
                        100
                      ).toFixed(0)}
                      %
                    </td>


                    <td>
                      <RiskStamp
                        level={
                          customer.riskLevel
                        }
                      />
                    </td>

                  </tr>
                )
              )

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


      {/* Add Customer Modal */}
      {showAdd && (

        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-6"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              setShowAdd(false);
            }
          }}
        >

          <div className="bg-[#f1eee6] border line w-full max-w-3xl max-h-[90vh] overflow-auto p-7">

            <div className="flex items-center justify-between mb-7">

              <div>
                <div className="mono text-[10px] muted tracking-widest">
                  CUSTOMER RECORD
                </div>

                <h2 className="serif text-3xl mt-1">
                  Add customer
                </h2>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setShowAdd(false)
                }
                className="text-2xl muted"
              >
                ×
              </button>

            </div>


            <form
              onSubmit={handleCreate}
              className="grid grid-cols-2 gap-5"
            >

              <div>
                <label className="field-label">
                  External ID
                </label>

                <input
                  name="externalId"
                  value={form.externalId}
                  onChange={updateField}
                  required
                  placeholder="Customer 02300"
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                  placeholder="Customer name"
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  Plan
                </label>

                <select
                  name="planType"
                  value={form.planType}
                  onChange={updateField}
                  className="field-input"
                >
                  <option value="basic">
                    Basic
                  </option>

                  <option value="standard">
                    Standard
                  </option>

                  <option value="premium">
                    Premium
                  </option>
                </select>
              </div>


              <div>
                <label className="field-label">
                  Monthly Revenue
                </label>

                <input
                  type="number"
                  name="monthlyRevenue"
                  value={form.monthlyRevenue}
                  onChange={updateField}
                  min="0"
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  Tenure Months
                </label>

                <input
                  type="number"
                  name="tenureMonths"
                  value={form.tenureMonths}
                  onChange={updateField}
                  min="0"
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  Support Tickets (90d)
                </label>

                <input
                  type="number"
                  name="supportTickets90d"
                  value={
                    form.supportTickets90d
                  }
                  onChange={updateField}
                  min="0"
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  Payment Failures (90d)
                </label>

                <input
                  type="number"
                  name="paymentFailures90d"
                  value={
                    form.paymentFailures90d
                  }
                  onChange={updateField}
                  min="0"
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  Usage Change %
                </label>

                <input
                  type="number"
                  name="usageChangePct"
                  value={
                    form.usageChangePct
                  }
                  onChange={updateField}
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  NPS
                </label>

                <input
                  type="number"
                  name="nps"
                  value={form.nps}
                  onChange={updateField}
                  min="-100"
                  max="100"
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  Days Since Login
                </label>

                <input
                  type="number"
                  name="daysSinceLogin"
                  value={
                    form.daysSinceLogin
                  }
                  onChange={updateField}
                  min="0"
                  className="field-input"
                />
              </div>


              <div>
                <label className="field-label">
                  Discount %
                </label>

                <input
                  type="number"
                  name="discountPct"
                  value={form.discountPct}
                  onChange={updateField}
                  min="0"
                  max="100"
                  className="field-input"
                />
              </div>


              {/* Error */}
              {formError && (
                <div className="col-span-2 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}


              {/* Buttons */}
              <div className="col-span-2 flex justify-end gap-3 pt-3 border-t line">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setShowAdd(false)
                  }
                  className="px-5 py-3 text-sm border line"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 text-sm bg-[#193532] text-[#f1eee6] disabled:opacity-60"
                >
                  {saving
                    ? "Creating..."
                    : "Create customer"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </>
  );
}