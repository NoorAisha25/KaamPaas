import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Icon from "../components/Icon";

const BUDGET_UNIT_KEY = { day: "perDay", hour: "perHour", month: "perMonth" };

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isWorker = user?.role === "worker";
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get("/jobs/mine").then((res) => setJobs(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="section-eyebrow">{t("dashboard_eyebrow")}</div>
        <h1 style={{ fontSize: 40, margin: "4px 0 24px" }}>
          {t("greeting")}, {user?.name}
        </h1>

        {/* Quick actions are the ONLY way to reach Find Workers/Find Jobs/
            Post a Job now - removed from the navbar to avoid showing the
            same destination in two places. */}
        <div className="grid-4-responsive" style={{ marginBottom: 40 }}>
          {!isWorker && (
            <Link to="/post-job" className="quick-action-card">
              <div className="quick-action-icon" style={{ background: "#fee7d6" }}>
                <Icon name="plus" size={20} style={{ color: "var(--KaamPaas-orange)" }} />
              </div>
              {t("quickAction_postJob")}
            </Link>
          )}
          <Link to={isWorker ? "/find-jobs" : "/workers"} className="quick-action-card">
            <div className="quick-action-icon" style={{ background: "#d1fae5" }}>
              <Icon name="search" size={20} style={{ color: "var(--KaamPaas-green)" }} />
            </div>
            {isWorker ? t("quickAction_findJobs") : t("quickAction_findWorkers")}
          </Link>
          <Link to="/jobs" className="quick-action-card">
            <div className="quick-action-icon" style={{ background: "#dbeafe" }}>
              <Icon name="briefcase" size={20} style={{ color: "var(--KaamPaas-blue)" }} />
            </div>
            {t("quickAction_myJobs")}
          </Link>
          <Link to="/profile" className="quick-action-card">
            <div className="quick-action-icon" style={{ background: "#f3f4f6" }}>
              <Icon name="user" size={20} />
            </div>
            {t("quickAction_profile")}
          </Link>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800 }}>{t("section_myJobs")}</h2>
        {jobs.length === 0 && <p style={{ color: "var(--text-muted)" }}>{t("noJobsYet")}</p>}
        <div className="grid-3-responsive">
          {jobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ marginBottom: 10 }}>
                {job.urgency === "today" && <span className="status-badge status-open">TODAY</span>}
                <span className={`status-badge status-${job.status}`}>{job.status.toUpperCase()}</span>
              </div>
              <h3 style={{ margin: "0 0 8px" }}>{job.title}</h3>
              <p style={{ color: "var(--text-muted)", margin: "0 0 12px", fontSize: 14 }}>
                {t(`skill_${job.skill}`)} · {job.city}
              </p>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                ₹{job.budget}
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
                  {t(BUDGET_UNIT_KEY[job.budgetType] || "perDay")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
