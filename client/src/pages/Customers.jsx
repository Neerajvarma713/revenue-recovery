import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Activity,
  CircleDollarSign,
  UserPlus,
  X,
} from "lucide-react";

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
          className="fixed inset-0 z-50 bg-[#102b28]/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-customer-title"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !saving
            ) {
              setShowAdd(false);
            }
          }}
        >

          <div className="bg-[#f1eee6] border line w-full max-w-3xl max-h-[92vh] overflow-auto shadow-soft">

            <div className="px-5 py-5 sm:px-8 sm:py-6 border-b line flex items-start justify-between gap-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 shrink-0 bg-[#dfe5db] ink grid place-items-center">
                  <UserPlus size={19} strokeWidth={1.8} />
                </div>

                <div>
                  <div className="mono text-[10px] muted tracking-widest">
                    CUSTOMER RECORD / NEW
                  </div>
                  <h2 id="add-customer-title" className="serif text-3xl mt-1">
                    Add customer
                  </h2>
                  <p className="text-sm muted mt-1">
                    Add account details to begin retention monitoring.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setShowAdd(false)
                }
                aria-label="Close add customer form"
                className="p-2 -mr-2 -mt-2 muted hover:ink transition-colors"
              >
                <X size={20} strokeWidth={1.8} />
              </button>

            </div>


            <form
              onSubmit={handleCreate}
              className="p-5 sm:p-8"
            >
              <section className="form-section">
                <div className="form-section-heading">
                  <div>
                    <h3 className="form-section-title">Account details</h3>
                    <p className="form-section-help">Identify the customer and choose their current plan.</p>
                  </div>
                  <span className="form-step">01</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label" htmlFor="customer-external-id">External ID <span>*</span></label>
                    <input id="customer-external-id" name="externalId" value={form.externalId} onChange={updateField} required placeholder="e.g. CUST-02300" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="customer-name">Name <span>*</span></label>
                    <input id="customer-name" name="name" value={form.name} onChange={updateField} required placeholder="Customer name" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="customer-plan">Plan</label>
                    <select id="customer-plan" name="planType" value={form.planType} onChange={updateField} className="field-input">
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="customer-tenure">Tenure <span className="field-suffix">months</span></label>
                    <input id="customer-tenure" type="number" name="tenureMonths" value={form.tenureMonths} onChange={updateField} min="0" placeholder="0" className="field-input" />
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-heading">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign size={17} className="amber" strokeWidth={1.8} />
                    <div>
                      <h3 className="form-section-title">Commercial profile</h3>
                      <p className="form-section-help">Use the latest account value and discount information.</p>
                    </div>
                  </div>
                  <span className="form-step">02</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label" htmlFor="customer-revenue">Monthly revenue <span className="field-suffix">USD</span></label>
                    <input id="customer-revenue" type="number" name="monthlyRevenue" value={form.monthlyRevenue} onChange={updateField} min="0" placeholder="0" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="customer-discount">Discount <span className="field-suffix">%</span></label>
                    <input id="customer-discount" type="number" name="discountPct" value={form.discountPct} onChange={updateField} min="0" max="100" placeholder="0" className="field-input" />
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="form-section-heading">
                  <div className="flex items-center gap-2">
                    <Activity size={17} className="amber" strokeWidth={1.8} />
                    <div>
                      <h3 className="form-section-title">Engagement signals</h3>
                      <p className="form-section-help">These signals help calculate the initial churn-risk score.</p>
                    </div>
                  </div>
                  <span className="form-step">03</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label" htmlFor="customer-tickets">Support tickets <span className="field-suffix">last 90d</span></label>
                    <input id="customer-tickets" type="number" name="supportTickets90d" value={form.supportTickets90d} onChange={updateField} min="0" placeholder="0" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="customer-failures">Payment failures <span className="field-suffix">last 90d</span></label>
                    <input id="customer-failures" type="number" name="paymentFailures90d" value={form.paymentFailures90d} onChange={updateField} min="0" placeholder="0" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="customer-usage">Usage change <span className="field-suffix">%</span></label>
                    <input id="customer-usage" type="number" name="usageChangePct" value={form.usageChangePct} onChange={updateField} placeholder="e.g. -12" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="customer-nps">NPS <span className="field-suffix">-100 to 100</span></label>
                    <input id="customer-nps" type="number" name="nps" value={form.nps} onChange={updateField} min="-100" max="100" placeholder="0" className="field-input" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="customer-login">Days since login</label>
                    <input id="customer-login" type="number" name="daysSinceLogin" value={form.daysSinceLogin} onChange={updateField} min="0" placeholder="0" className="field-input" />
                  </div>
                </div>
              </section>


              {/* Error */}
              {formError && (
                <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-5" role="alert">
                  {formError}
                </div>
              )}


              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t line">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setShowAdd(false)
                  }
                  className="px-5 py-3 text-sm border line hover:bg-[#e5e8df] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 text-sm bg-[#193532] text-[#f1eee6] disabled:opacity-60 hover:bg-[#28504a] transition-colors"
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