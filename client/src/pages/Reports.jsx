
import { useEffect, useState } from "react";
import { FileText, CalendarDays, RefreshCw } from "lucide-react";
import api from "../services/api";
import "../App.css";

const today = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const SLOT_LABELS = {
  MORNING: "Morning (fasting)",
  AFTER_BREAKFAST: "After breakfast",
  AFTER_LUNCH: "After lunch",
  AFTER_DINNER: "After dinner",
};

function Reports() {
  const [selectedDate, setSelectedDate] = useState(today());
  const [reportType, setReportType] = useState("daily");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/reports/${reportType}?date=${selectedDate}`
      );

      setReport(response.data.report);
    } catch (err) {
      setReport(null);
      setError(
        err.response?.data?.message || "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedDate]);

  const summary = report?.summary || {};
  const readings = report?.readings || [];

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(`${String(value).slice(0, 10)}T00:00:00`)
      .toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  };

  const getPeriodLabel = () => {
    if (!report) return "";

    return `${formatDate(report.startDate)} – ${formatDate(report.endDate)}`;
  };

  return (
    <>
      <header className="premium-header">
        <div className="header-breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-divider">/</span>
          <strong>Reports</strong>
        </div>
      </header>

      <main className="reports-page">
        <div className="reports-header">
          <div>
            <div className="reports-eyebrow">
              <FileText size={15} /> GLUCOSE REPORTS
            </div>
            <h1>Reports</h1>
            <p>Review your glucose measurements and statistics.</p>
          </div>

          <button
            className="reports-refresh"
            onClick={fetchReport}
            disabled={loading}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <section className="reports-filter">
          <div>
            <CalendarDays size={17} />
            <span>Selected date</span>
          </div>

          <input
            type="date"
            max={today()}
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />

          <select
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="month-to-date">Month-to-date</option>
            <option value="monthly">Previous month</option>
          </select>
        </section>

        {error && <div className="reports-error">{error}</div>}

        {loading ? (
          <div className="reports-empty">Loading report...</div>
        ) : report ? (
          <>
            <section className="reports-chart-panel">
              <h2>
                {reportType === "daily"
                  ? "Daily report"
                  : reportType === "month-to-date"
                    ? "Month-to-date report"
                    : "Previous month report"}
              </h2>

              <p>{getPeriodLabel()}</p>

              <div className="reports-stats">
                <ReportCard
                  label="Highest"
                  value={summary.highest}
                />
                <ReportCard
                  label="Lowest"
                  value={summary.lowest}
                />
                <ReportCard
                  label="Average"
                  value={
                    summary.average === null
                      ? "—"
                      : Number(summary.average).toFixed(1)
                  }
                />
                <ReportCard
                  label="Number of readings"
                  value={summary.totalReadings ?? 0}
                />
              </div>
            </section>

            <section className="reports-history">
              <div className="reports-panel-heading">
                <div>
                  <h2>
                    {reportType === "daily"
                      ? "Daily readings"
                      : "Readings in this report"}
                  </h2>
                  <p>{readings.length} readings recorded</p>
                </div>
              </div>

              {readings.length === 0 ? (
                <div className="reports-empty">
                  No readings found for this period. Add a reading to
                  see your report.
                </div>
              ) : (
                <div className="reports-table-wrapper">
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>TIME SLOT</th>
                        <th>GLUCOSE VALUE</th>
                        <th>NOTES</th>
                      </tr>
                    </thead>

                    <tbody>
                      {readings.map((reading) => (
                        <tr key={reading.id}>
                          <td>{formatDate(reading.measuredAt)}</td>
                          <td>
                            {SLOT_LABELS[reading.slot] || reading.slot}
                          </td>
                          <td>
                            <strong>{reading.glucoseValue} mg/dl</strong>
                          </td>
                          <td>{reading.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}

function ReportCard({ label, value }) {
  return (
    <div className="reports-stat-card">
      <span>{label}</span>
      <div className="reports-stat-value">
        {value ?? "—"}
        {label !== "Number of readings" && value !== null && value !== "—"
          ? <small> mg/dl</small>
          : null}
      </div>
    </div>
  );
}

export default Reports;
