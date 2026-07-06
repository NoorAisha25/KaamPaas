import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Icon from "../components/Icon";

export default function JobList() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/jobs/mine").then((res) => setJobs(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="section-eyebrow">{t("browse_eyebrow")}</div>
        <h1 className="section-title">{t("section_myJobs")}</h1>

        {loading && <p>Loading...</p>}
        {!loading && jobs.length === 0 && <p style={{ color: "var(--text-muted)" }}>{t("noJobsYet")}</p>}

        <div className="grid-3-responsive">
          {jobs.map((job) => (
            <Link key={job._id} to={`/jobs/${job._id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
              <span className={`status-badge status-${job.status}`}>{job.status.toUpperCase()}</span>
              <h3 style={{ margin: "10px 0 6px" }}>{job.title}</h3>
              <p className="icon-btn" style={{ color: "var(--text-muted)", fontSize: 14 }}>
                <Icon name="wrench" size={13} /> {t(`skill_${job.skill}`)}
                <Icon name="mapPinSmall" size={13} style={{ marginLeft: 8 }} /> {job.city}
              </p>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>
                ₹{job.budget}
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
                  {t({ day: "perDay", hour: "perHour", month: "perMonth" }[job.budgetType] || "perDay")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
