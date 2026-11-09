
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import api from "../services/api";
import "../App.css";

const SLOTS = [
  { value: "MORNING", label: "Morning (fasting)" },
  { value: "AFTER_BREAKFAST", label: "After breakfast" },
  { value: "AFTER_LUNCH", label: "After lunch" },
  { value: "AFTER_DINNER", label: "After dinner" },
];

const today = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const formatDate = (value) =>
  new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString();

function Readings() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    glucoseValue: "",
    measuredAt: today(),
    slot: "MORNING",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);

  const fetchReadings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/readings");
      setReadings(response.data.readings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load readings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (reading) => {
    setEditingId(reading.id);
    setForm({
      glucoseValue: String(reading.glucoseValue),
      measuredAt: String(reading.measuredAt).slice(0, 10),
      slot: reading.slot,
      notes: reading.notes || "",
    });
    setError("");
    setShowForm(true);
  };

  const saveReading = async (event) => {
    event.preventDefault();
    setError("");

    const value = Number(form.glucoseValue);

    if (!Number.isInteger(value) || value < 40 || value > 600) {
      setError("Value must be between 40 and 600 mg/dl.");
      return;
    }

    if (!form.measuredAt) {
      setError("Please select a reading date.");
      return;
    }

    if (form.measuredAt > today()) {
      setError("Date cannot be in the future.");
      return;
    }

    if (!SLOTS.some((slot) => slot.value === form.slot)) {
      setError("Please select a valid time slot.");
      return;
    }

    const payload = {
      glucoseValue: value,
      measuredAt: form.measuredAt,
      slot: form.slot,
      notes: form.notes.trim(),
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/readings/${editingId}`, payload);
      } else {
        await api.post("/readings", payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchReadings();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save reading."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeReading = async (id) => {
    if (!window.confirm("Delete this glucose reading?")) return;

    try {
      await api.delete(`/readings/${id}`);
      await fetchReadings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete reading.");
    }
  };

  const slotLabel = (value) =>
    SLOTS.find((slot) => slot.value === value)?.label || value;

  return (
    <>
      <header className="premium-header">
        <div className="header-breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-divider">/</span>
          <strong>My Readings</strong>
        </div>
      </header>

      <main className="modern-readings-page">
        <section className="modern-readings-heading">
          <div>
            <h1>My Glucose Readings</h1>
            <p>Record and manage your daily glucose measurements.</p>
          </div>

          <button className="modern-add-button" onClick={openAdd}>
            <Plus size={18} /> Add reading
          </button>
        </section>

        {error && <div className="modern-error">{error}</div>}

        <section className="modern-records-panel">
          <div className="modern-records-heading">
            <div>
              <h2>Reading history</h2>
              <p>{readings.length} total readings</p>
            </div>

            <button
              className="modern-refresh-button"
              onClick={fetchReadings}
              disabled={loading}
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="modern-table-empty">Loading readings...</div>
          ) : readings.length === 0 ? (
            <div className="modern-table-empty">
              <strong>No readings yet</strong>
              <span>Add your first glucose reading.</span>
              <button className="modern-add-button" onClick={openAdd}>
                <Plus size={16} /> Add reading
              </button>
            </div>
          ) : (
            <div className="modern-table-wrapper">
              <table className="modern-readings-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>TIME SLOT</th>
                    <th>GLUCOSE VALUE</th>
                    <th>NOTES</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {readings.map((reading) => (
                    <tr key={reading.id}>
                      <td>{formatDate(reading.measuredAt)}</td>
                      <td>{slotLabel(reading.slot)}</td>
                      <td>
                        <strong>{reading.glucoseValue} mg/dl</strong>
                      </td>
                      <td>{reading.notes || "—"}</td>
                      <td>
                        <div className="modern-row-actions">
                          <button
                            title="Edit"
                            onClick={() => openEdit(reading)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => removeReading(reading.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showForm && (
          <div className="modal-backdrop">
            <div className="reading-modal">
              <div className="modal-heading">
                <div>
                  <h2>{editingId ? "Edit reading" : "Add reading"}</h2>
                  <p>Enter your glucose measurement.</p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => !saving && setShowForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={saveReading}>
                <label>
                  Glucose value (mg/dl)
                  <input
                    className="modal-field"
                    type="number"
                    min="40"
                    max="600"
                    step="1"
                    required
                    value={form.glucoseValue}
                    onChange={(event) =>
                      setForm({ ...form, glucoseValue: event.target.value })
                    }
                    placeholder="40–600"
                  />
                </label>

                <label>
                  Reading date
                  <input
                    className="modal-field"
                    type="date"
                    max={today()}
                    required
                    value={form.measuredAt}
                    onChange={(event) =>
                      setForm({ ...form, measuredAt: event.target.value })
                    }
                  />
                </label>

                <label>
                  Time slot
                  <select
                    className="modal-field"
                    required
                    value={form.slot}
                    onChange={(event) =>
                      setForm({ ...form, slot: event.target.value })
                    }
                  >
                    {SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Notes (optional)
                  <textarea
                    className="modal-field modal-textarea"
                    maxLength={1000}
                    value={form.notes}
                    onChange={(event) =>
                      setForm({ ...form, notes: event.target.value })
                    }
                    placeholder="Add notes..."
                  />
                </label>

                {error && <div className="auth-error">{error}</div>}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="premium-primary-button"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save reading"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Readings;
