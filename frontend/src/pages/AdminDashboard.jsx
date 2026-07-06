import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Icon from "../components/Icon";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div className="quick-action-icon" style={{ background: color }}>
          <Icon name={icon} size={18} />
        </div>
        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") return;
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => setError(t("admin_accessDenied")));
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <div>
        <Navbar />
        <div className="container">
          <p className="error-text">{t("admin_accessDenied")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="section-eyebrow">ADMIN</div>
        <h1 className="section-title">{t("admin_title")}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: -12, marginBottom: 32 }}>{t("admin_subtitle")}</p>

        {error && <p className="error-text">{error}</p>}

        {stats && (
          <>
            <div className="grid-4-responsive" style={{ marginBottom: 24 }}>
              <StatCard label={t("admin_totalWorkers")} value={stats.users.totalWorkers} icon="hardhat" color="#fee7d6" />
              <StatCard label={t("admin_totalHirers")} value={stats.users.totalHirers} icon="briefcase" color="#dbeafe" />
              <StatCard label={t("admin_verifiedWorkers")} value={stats.users.verifiedWorkers} icon="checkCircle" color="#d1fae5" />
              <StatCard label={t("admin_availableWorkers")} value={stats.users.availableWorkers} icon="user" color="#f3f4f6" />
            </div>

            <div className="grid-4-responsive" style={{ marginBottom: 40 }}>
              <StatCard label={t("admin_totalJobs")} value={stats.jobs.totalJobs} icon="briefcase" color="#fee7d6" />
              <StatCard label={t("admin_openJobs")} value={stats.jobs.openJobs} icon="search" color="#d1fae5" />
              <StatCard label={t("admin_completedJobs")} value={stats.jobs.completedJobs} icon="checkCircle" color="#dbeafe" />
              <StatCard label={t("admin_cancelledJobs")} value={stats.jobs.cancelledJobs} icon="user" color="#fee2e2" />
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>{t("admin_recentSignups")}</h2>
            <div className="card">
              {stats.recentUsers.map((u) => (
                <div
                  key={u._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span>
                    <strong>{u.name}</strong> · {u.role} · {u.city}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
