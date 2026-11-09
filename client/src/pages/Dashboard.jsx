import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Plus,
  Droplets,
  HeartPulse,
  CalendarDays,
  ChevronDown,
  Search,
  ArrowUpRight,
  Clock3,
  X,
  Pencil,
  Trash2,
  Sparkles,
  FileText,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../App.css";

const READING_SLOTS = [
  { value: "MORNING", label: "Morning (fasting)" },
  { value: "AFTER_BREAKFAST", label: "After breakfast" },
  { value: "AFTER_LUNCH", label: "After lunch" },
  { value: "AFTER_DINNER", label: "After dinner" },
];

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getSlotLabel = (slotValue) =>
  READING_SLOTS.find((slot) => slot.value === slotValue)?.label ||
  slotValue ||
  "—";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [readings, setReadings] = useState([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("7 days");

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const notificationRef = useRef(null);
  const accountMenuRef = useRef(null);

  const [form, setForm] = useState({
    glucoseValue: "",
    measuredAt: getToday(),
    slot: "MORNING",
    notes: "",
  });

  // Fetch readings
  const fetchReadings = async () => {
    setLoadingReadings(true);
    setApiError("");

    try {
      const response = await api.get("/readings");
      setReadings(response.data.readings || []);
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Unable to load readings"
      );
    } finally {
      setLoadingReadings(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Open add modal
  const openAddModal = () => {
    setEditingId(null);
    setApiError("");

    setForm({
      glucoseValue: "",
      measuredAt: getToday(),
      slot: "MORNING",
      notes: "",
    });

    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (reading) => {
    setEditingId(reading.id);
    setApiError("");

    setForm({
      glucoseValue: String(reading.glucoseValue),
      measuredAt: String(reading.measuredAt).slice(0, 10),
      slot: reading.slot || "MORNING",
      notes: reading.notes || "",
    });

    setShowModal(true);
  };

  // Save reading
  const saveReading = async (event) => {
    event.preventDefault();
    setApiError("");

    const value = Number(form.glucoseValue);

    // Validate whole number between 40 and 600
    if (!Number.isInteger(value) || value < 40 || value > 600) {
      setApiError(
        "Glucose value must be a whole number between 40 and 600 mg/dL."
      );
      return;
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.measuredAt)) {
      setApiError("Please select a valid reading date.");
      return;
    }

    // Reject future dates
    if (form.measuredAt > getToday()) {
      setApiError("Reading date cannot be in the future.");
      return;
    }

    // Validate slot
    if (!READING_SLOTS.some((item) => item.value === form.slot)) {
      setApiError("Please select a valid reading slot.");
      return;
    }

    // Send date-only value to backend
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

      setShowModal(false);
      setEditingId(null);

      await fetchReadings();
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "Unable to save reading"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete reading
  const deleteReading = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reading?")) {
      return;
    }

    try {
      setApiError("");
      await api.delete(`/readings/${id}`);
      await fetchReadings();
    } catch (error) {
      setApiError(
        error.response?.data?.message || "Unable to delete reading"
      );
    }
  };

  // Logout
  const handleLogout = async () => {
    setShowAccountMenu(false);
    await logout();
    navigate("/login");
  };

  // Search readings
  const filteredReadings = useMemo(() => {
    return readings.filter((reading) =>
      `${reading.glucoseValue} ${reading.slot || ""} ${
        reading.notes || ""
      } ${reading.measuredAt}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [readings, search]);

  const latestReading = readings[0];

  const average = readings.length
    ? Math.round(
        readings.reduce(
          (sum, reading) => sum + reading.glucoseValue,
          0
        ) / readings.length
      )
    : 0;

  const trackingDays = new Set(
    readings.map((reading) =>
      String(reading.measuredAt).slice(0, 10)
    )
  ).size;

  // Chart data
  const chartData = useMemo(() => {
    const days = Number.parseInt(range, 10);
    const cutoff = new Date();

    cutoff.setDate(cutoff.getDate() - days);

    return [...readings]
      .filter((reading) => new Date(reading.measuredAt) >= cutoff)
      .sort(
        (a, b) =>
          new Date(a.measuredAt) - new Date(b.measuredAt)
      )
      .map((reading) => ({
        day: new Date(reading.measuredAt).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric" }
        ),
        value: reading.glucoseValue,
      }));
  }, [readings, range]);

  const unreadNotifications = readings.length === 0 ? 1 : 0;

  return (
    <>
      {/* Header */}
      <header className="premium-header">
        <div className="header-breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-divider">/</span>
          <strong>Dashboard</strong>
        </div>

        <div className="header-right">
          <span className="preview-indicator">
            <span /> Live data
          </span>

          {/* Notifications */}
          <div className="dashboard-menu-wrapper" ref={notificationRef}>
            <button
              className="header-icon notification-button"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              onClick={() => {
                setShowNotifications((previous) => !previous);
                setShowAccountMenu(false);
              }}
            >
              <Bell size={19} />

              {unreadNotifications > 0 && (
                <span className="notification-dot" />
              )}
            </button>

            {showNotifications && (
              <div className="dashboard-dropdown notification-dropdown">
                <div className="dropdown-heading">
                  <strong>Notifications</strong>
                  <span>{unreadNotifications} update</span>
                </div>

                {readings.length === 0 ? (
                  <div className="notification-item">
                    <div className="notification-item-icon">
                      <Droplets size={18} />
                    </div>

                    <div>
                      <strong>Start tracking your glucose</strong>
                      <p>
                        Add your first measurement to see your health
                        activity here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="notification-item">
                    <div className="notification-item-icon">
                      <HeartPulse size={18} />
                    </div>

                    <div>
                      <strong>Your readings are available</strong>
                      <p>
                        You have {readings.length} recorded measurements.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  className="dropdown-footer-button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/readings");
                  }}
                >
                  View my readings
                </button>
              </div>
            )}
          </div>

          {/* Account dropdown */}
          <div className="dashboard-menu-wrapper" ref={accountMenuRef}>
            <button
              className="header-profile"
              onClick={() => {
                setShowAccountMenu((previous) => !previous);
                setShowNotifications(false);
              }}
              aria-expanded={showAccountMenu}
            >
              <div className="profile-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <span>{user?.name || "User"}</span>
              <ChevronDown size={15} />
            </button>

            {showAccountMenu && (
              <div className="dashboard-dropdown account-dropdown">
                <div className="dropdown-user">
                  <div className="profile-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <strong>{user?.name || "User"}</strong>
                    <span>{user?.email || "Personal account"}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    navigate("/profile");
                  }}
                >
                  <UserRound size={17} />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    navigate("/settings");
                  }}
                >
                  <Settings size={17} />
                  Settings
                </button>

                <button
                  className="dropdown-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Welcome section */}
      <section className="premium-welcome">
        <div className="welcome-content">
          <div className="welcome-eyebrow">
            <Sparkles size={14} /> YOUR PERSONAL HEALTH SPACE
          </div>

          <h1>
            Welcome back, {user?.name || "there"}! <span>✦</span>
          </h1>

          <p>
            Every little step counts. Here's your glucose overview.
          </p>

          <div className="welcome-date">
            <CalendarDays size={15} />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        <div className="welcome-art">
          <div className="art-circle art-circle-one" />
          <div className="art-circle art-circle-two" />

          <div className="glucose-device">
            <HeartPulse size={25} />
            <strong>{latestReading?.glucoseValue ?? "—"}</strong>
            <span>mg/dL</span>
            <small>GLUCOSE</small>
          </div>

          <div className="art-sparkle">
            <Sparkles size={19} />
          </div>
        </div>
      </section>

      {/* Section heading */}
      <div className="section-heading">
        <div>
          <h2>Your health at a glance</h2>
          <p>A snapshot of your recent tracking activity</p>
        </div>

        <div className="date-selector">
          <CalendarDays size={15} />
          All records
        </div>
      </div>

      {apiError && (
        <div className="auth-error" style={{ marginBottom: 15 }}>
          {apiError}
        </div>
      )}

      {/* Statistics */}
      <section className="premium-stats">
        <StatCard
          icon={Droplets}
          title="Latest reading"
          value={latestReading?.glucoseValue ?? "—"}
          unit="mg/dL"
          detail={
            latestReading
              ? new Date(latestReading.measuredAt).toLocaleString()
              : "No readings yet"
          }
          tone="violet"
          trend="Most recent"
        />

        <StatCard
          icon={HeartPulse}
          title="Average glucose"
          value={readings.length ? average : "—"}
          unit="mg/dL"
          detail="Across your recorded readings"
          tone="pink"
          trend="All records"
        />

        <StatCard
          icon={HeartPulse}
          title="Total readings"
          value={readings.length}
          unit="entries"
          detail="Your measurements"
          tone="blue"
          trend="Total"
        />

        <StatCard
          icon={CalendarDays}
          title="Tracking days"
          value={trackingDays}
          unit="days"
          detail="Days with measurements"
          tone="orange"
          trend="Total"
        />
      </section>

      {/* Charts and quick actions */}
      <section className="premium-content-grid">
        <div className="premium-panel trend-panel">
          <div className="panel-top">
            <div>
              <div className="panel-title-row">
                <h3>Glucose overview</h3>
                <span className="live-dot" />
              </div>
              <p>Your recorded measurement trends</p>
            </div>

            <select
              className="premium-select"
              value={range}
              onChange={(event) => setRange(event.target.value)}
            >
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
            </select>
          </div>

          <div className="chart-summary">
            <div>
              <span>Overall average</span>
              <strong>
                {readings.length ? average : "—"} <small>mg/dL</small>
              </strong>
            </div>

            <div className="chart-legend">
              <span className="legend-dot" /> Glucose readings
            </div>
          </div>

          <div className="premium-chart">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="premiumFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8846E8"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#8846E8"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#F0EAF7"
                    strokeDasharray="4 5"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#998CA9", fontSize: 11 }}
                    dy={12}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#998CA9", fontSize: 11 }}
                    width={35}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #eee5f8",
                    }}
                    formatter={(value) => [
                      `${value} mg/dL`,
                      "Glucose",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8641E5"
                    strokeWidth={3}
                    fill="url(#premiumFill)"
                    activeDot={{ r: 6 }}
                    dot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                {loadingReadings
                  ? "Loading glucose data..."
                  : "No readings in this date range."}
              </div>
            )}
          </div>

          <div className="chart-footer">
            <span>
              <Clock3 size={13} /> Your recorded measurements
            </span>
            <span>Values shown in mg/dL</span>
          </div>
        </div>

        <div className="premium-panel quick-panel">
          <div className="panel-top">
            <div>
              <h3>Quick actions</h3>
              <p>Keep your health records updated</p>
            </div>
          </div>

          <div className="quick-card">
            <div className="quick-card-icon">
              <Droplets size={25} />
            </div>

            <span className="quick-card-label">NEW MEASUREMENT</span>
            <h3>Record your glucose</h3>

            <p>
              Add a new measurement to keep your health history up to date.
            </p>

            <button
              className="premium-primary-button"
              onClick={openAddModal}
            >
              <Plus size={17} /> Add new reading
            </button>
          </div>

          <button
            className="quick-secondary"
            onClick={() => navigate("/reports")}
          >
            <div className="quick-secondary-icon">
              <FileText size={18} />
            </div>

            <div>
              <strong>View health reports</strong>
              <span>Explore your tracking history</span>
            </div>

            <ArrowUpRight size={17} />
          </button>
        </div>
      </section>

      {/* Recent readings table */}
      <section className="premium-panel readings-panel">
        <div className="panel-top readings-heading">
          <div>
            <h3>Recent readings</h3>
            <p>Your latest glucose measurements</p>
          </div>

          <button
            className="premium-outline-button"
            onClick={openAddModal}
          >
            <Plus size={16} /> Add reading
          </button>
        </div>

        <div className="table-toolbar">
          <div className="table-search">
            <Search size={16} />
            <input
              placeholder="Search readings or notes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <span className="table-count">
            {filteredReadings.length} entries
          </span>
        </div>

        {loadingReadings ? (
          <div className="empty-state">Loading your readings...</div>
        ) : (
          <div className="table-scroll">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>MEASUREMENT</th>
                  <th>DATE</th>
                  <th>TIME SLOT</th>
                  <th>GLUCOSE VALUE</th>
                  <th>NOTES</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredReadings.map((reading) => (
                  <tr key={reading.id}>
                    <td>
                      <div className="measurement-cell">
                        <div className="measurement-icon">
                          <Droplets size={16} />
                        </div>
                        <strong>Glucose reading</strong>
                      </div>
                    </td>

                    <td>
                      <strong className="table-date">
                        {String(reading.measuredAt).slice(0, 10)}
                      </strong>
                    </td>

                    <td>{getSlotLabel(reading.slot)}</td>

                    <td>
                      <strong className="glucose-value">
                        {reading.glucoseValue}
                      </strong>
                      <span className="glucose-unit"> mg/dL</span>
                    </td>

                    <td className="table-note">
                      {reading.notes || "—"}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          aria-label="Edit reading"
                          onClick={() => openEditModal(reading)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          aria-label="Delete reading"
                          onClick={() => deleteReading(reading.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredReadings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="no-readings">
                      No readings found. Add your first glucose reading!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-bottom">
          <span>Your personal glucose records</span>
          <button onClick={() => navigate("/reports")}>
            View reports <ArrowUpRight size={14} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="premium-footer">
        <span>© 2026 Sweety Glucose Tracker</span>
        <span>
          Designed with care <span className="footer-heart">♥</span>
        </span>
      </footer>

      {/* Add / Edit Reading Modal */}
      {showModal && (
        <div
          className="modal-backdrop"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            className="reading-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <div className="modal-icon">
                  <Droplets size={22} />
                </div>

                <h2>
                  {editingId ? "Edit reading" : "Add new reading"}
                </h2>

                <p>Enter your glucose measurement details.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveReading}>
              {/* Glucose value */}
              <label>
                Glucose value (mg/dL) <span>*</span>

                <div className="modal-input">
                  <input
                    type="number"
                    min="40"
                    max="600"
                    step="1"
                    inputMode="numeric"
                    placeholder="Enter a whole number (40–600)"
                    value={form.glucoseValue}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        glucoseValue: event.target.value,
                      })
                    }
                    required
                  />

                  <span>mg/dL</span>
                </div>
              </label>

              {/* Measurement date */}
              <label>
                Measurement date <span>*</span>

                <input
                  className="modal-field"
                  type="date"
                  max={getToday()}
                  value={form.measuredAt}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      measuredAt: event.target.value,
                    })
                  }
                  required
                />
              </label>

              {/* Reading slot */}
              <label>
                Reading slot <span>*</span>

                <select
                  className="modal-field"
                  value={form.slot}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      slot: event.target.value,
                    })
                  }
                  required
                >
                  {READING_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Notes */}
              <label>
                Notes

                <textarea
                  className="modal-field modal-textarea"
                  placeholder="Add context about this measurement..."
                  value={form.notes}
                  maxLength={1000}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      notes: event.target.value,
                    })
                  }
                />
              </label>

              {apiError && (
                <div className="auth-error">{apiError}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="premium-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Save reading"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Statistics card
function StatCard({
  icon: Icon,
  title,
  value,
  unit,
  detail,
  tone,
  trend,
}) {
  return (
    <div className="premium-stat-card">
      <div className="stat-card-top">
        <div className={`premium-stat-icon ${tone}`}>
          <Icon size={21} />
        </div>
      </div>

      <span className="premium-stat-title">{title}</span>

      <div className="premium-stat-value">
        {value} <small>{unit}</small>
      </div>

      <div className="premium-stat-bottom">
        <span>{detail}</span>
        <span className="stat-trend">{trend}</span>
      </div>
    </div>
  );
}

export default Dashboard;