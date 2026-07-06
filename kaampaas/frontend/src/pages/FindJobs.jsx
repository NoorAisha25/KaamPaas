import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useLanguage } from "../context/LanguageContext";
import { getCurrentCoords } from "../utils/geolocation";
import Navbar from "../components/Navbar";
import SkillPillBar from "../components/SkillPillBar";
import Icon from "../components/Icon";

const BUDGET_UNIT_KEY = { day: "perDay", hour: "perHour", month: "perMonth" };

export default function FindJobs() {
  const { t } = useLanguage();
  const [skill, setSkill] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationChecked, setLocationChecked] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    getCurrentCoords().then((c) => {
      setCoords(c);
      setLocationChecked(true);
    });
  }, []);

  const fetchJobs = () => {
    setLoading(true);
    api
      .get("/jobs/matching", { params: { skill, lng: coords?.lng, lat: coords?.lat } })
      .then((res) => setJobs(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!locationChecked) return;
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationChecked, coords, skill]);

  const acceptJob = async (jobId) => {
    setAcceptingId(jobId);
    try {
      await api.patch(`/jobs/${jobId}/status`, { status: "accepted" });
      fetchJobs(); // accepted job drops out of the open-jobs list automatically
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="section-eyebrow">{t("findJobs_eyebrow")}</div>
        <h1 className="section-title">{t("findJobs_title")}</h1>

        <p style={{ color: coords ? "var(--KaamPaas-green)" : "var(--text-muted)", fontSize: 13, fontWeight: 600, marginTop: -8, marginBottom: 16 }}>
          {locationChecked ? (coords ? t("usingYourLocation") : t("locationDenied")) : ""}
        </p>

        <SkillPillBar selected={skill} onChange={setSkill} />

        {loading && <p>Loading...</p>}
        {!loading && jobs.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>{t("noMatchingJobs")}</p>
        )}

        <div className="grid-3-responsive">
          {jobs.map((job) => (
            <div key={job._id} className="card">
              <Link to={`/jobs/${job._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ marginBottom: 10 }}>
                  {job.urgency === "today" && <span className="status-badge status-open">TODAY</span>}
                  <span className={`status-badge status-${job.status}`}>{job.status.toUpperCase()}</span>
                </div>
                <h3 style={{ margin: "0 0 6px" }}>{job.title}</h3>
                <p className="icon-btn" style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 10 }}>
                  <Icon name="wrench" size={13} /> {t(`skill_${job.skill}`)}
                  <Icon name="mapPinSmall" size={13} style={{ marginLeft: 8 }} /> {job.city}
                </p>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                  ₹{job.budget}
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
                    {t(BUDGET_UNIT_KEY[job.budgetType] || "perDay")}
                  </span>
                </div>
                {job.hirer && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {job.hirer.name} · Trust {job.hirer.trustScore ?? 0}/100
                  </p>
                )}
              </Link>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: "10px 0" }}
                  onClick={() => acceptJob(job._id)}
                  disabled={acceptingId === job._id}
                >
                  {acceptingId === job._id ? "..." : t("action_accept")}
                </button>
                {job.hirer?.phone && (
                  <a href={`tel:${job.hirer.phone}`} className="btn-call icon-btn" style={{ flex: 1, justifyContent: "center" }}>
                    <Icon name="phone" size={15} />
                    {t("call")}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
