import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { SPEECH_LANG_MAP } from "../constants";
import { buildWhatsAppLink } from "../utils/whatsapp";
import Navbar from "../components/Navbar";
import Icon from "../components/Icon";
import StarRatingInput from "../components/StarRatingInput";
import MicButton from "../components/MicButton";

const NEXT_ACTIONS = {
  worker: {
    open: [{ label: "action_accept", next: "accepted" }],
    accepted: [{ label: "action_start", next: "in_progress" }],
    in_progress: [{ label: "action_complete", next: "completed" }],
  },
  hirer: {
    open: [{ label: "action_cancel", next: "cancelled" }],
    accepted: [{ label: "action_cancel", next: "cancelled" }],
  },
};

function TrustBar({ label, score }) {
  if (typeof score !== "number") return null;
  return (
    <div style={{ marginTop: 6, marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>
        <span>{label} Trust</span>
        <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>{score}/100</span>
      </div>
      <div style={{ height: 5, borderRadius: 999, background: "#f3f4f6", overflow: "hidden", maxWidth: 200 }}>
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: score >= 70 ? "var(--KaamPaas-green)" : score >= 40 ? "var(--KaamPaas-orange)" : "#ef4444",
          }}
        />
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const speechLang = SPEECH_LANG_MAP[lang];
  const [job, setJob] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const fetchJob = () => api.get(`/jobs/${id}`).then((res) => setJob(res.data));

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (newStatus) => {
    await api.patch(`/jobs/${id}/status`, { status: newStatus });
    fetchJob();
  };

  const submitReview = async () => {
    if (!rating) {
      setReviewError("Please select a star rating");
      return;
    }
    setReviewError("");
    setSubmitting(true);
    try {
      await api.post("/reviews", { jobId: id, rating, comment });
      setJustSubmitted(true);
      fetchJob(); // refresh so myReviewGiven flips server-side too
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return <div className="container">Loading...</div>;

  const actions = NEXT_ACTIONS[user.role]?.[job.status] || [];
  const otherParty = user.role === "worker" ? job.hirer : job.worker;
  const canReview = job.status === "completed" && !job.myReviewGiven && !justSubmitted && job.worker;
  const canContact = otherParty && ["accepted", "in_progress", "completed"].includes(job.status);

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: 600 }}>
        <span className={`status-badge status-${job.status}`}>{job.status.toUpperCase()}</span>
        <h1 style={{ margin: "10px 0" }}>{job.title}</h1>

        <div className="card" style={{ marginBottom: 16 }}>
          <p>{job.description || t("detail_noDescription")}</p>
          <p className="icon-btn"><Icon name="wrench" size={16} /> <strong>{t("detail_skill")}:</strong> {t(`skill_${job.skill}`)}</p>
          <p className="icon-btn"><Icon name="mapPinSmall" size={16} /> <strong>{t("detail_city")}:</strong> {job.city}</p>
          <p><strong>{t("detail_budget")}:</strong> ₹{job.budget} <span style={{ color: "var(--text-muted)" }}>{t({ day: "perDay", hour: "perHour", month: "perMonth" }[job.budgetType] || "perDay")}</span></p>
          <p><strong>{t("detail_urgency")}:</strong> {job.urgency}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <img
              src={job.hirer?.profilePhotoUrl || `https://picsum.photos/seed/${job.hirer?._id}/80/80`}
              alt={job.hirer?.name}
              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <p className="icon-btn" style={{ margin: 0 }}><strong>{t("detail_hirer")}:</strong> {job.hirer?.name}</p>
              <TrustBar label={t("detail_hirer")} score={job.hirer?.trustScore} />
            </div>
          </div>

          {job.worker && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
              <img
                src={job.worker?.profilePhotoUrl || `https://picsum.photos/seed/${job.worker?._id}/80/80`}
                alt={job.worker?.name}
                style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <p className="icon-btn" style={{ margin: 0 }}><strong>{t("detail_worker")}:</strong> {job.worker.name}</p>
                <TrustBar label={t("detail_worker")} score={job.worker?.trustScore} />
              </div>
            </div>
          )}
        </div>

        {/* ---- Contact the other party once a worker is assigned - Call
             plus WhatsApp with a predetermined message, WorkIndia-style ---- */}
        {canContact && (
          <div className="card" style={{ marginBottom: 16, display: "flex", gap: 10 }}>
            <a
              href={buildWhatsAppLink(otherParty.phone, t("whatsapp_message"))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-call icon-btn"
              style={{ background: "#25D366", flex: 1, justifyContent: "center" }}
            >
              <Icon name="phone" size={15} />
              {t("whatsapp")}
            </a>
            <a href={`tel:${otherParty.phone}`} className="btn-call icon-btn" style={{ flex: 1, justifyContent: "center" }}>
              <Icon name="phone" size={15} />
              {t("call")}
            </a>
          </div>
        )}

        {actions.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            {actions.map((action) => (
              <button
                key={action.next}
                className={action.next === "cancelled" ? "btn-dark" : "btn-primary"}
                onClick={() => updateStatus(action.next)}
                style={{ width: "100%", marginBottom: 10 }}
              >
                {t(action.label)}
              </button>
            ))}
          </div>
        )}

        {/* ---- The review step - this is what actually closes the loop:
             job completes -> both sides rate each other -> trust score
             updates -> future search results are re-ranked by it.
             Voice input on the comment field matters here specifically -
             typing a review is a real barrier for low-literacy users. ---- */}
        {canReview && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{t("review_title")}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t("review_subtitle")}</p>
            {otherParty?.name && (
              <p style={{ fontWeight: 700, marginBottom: 12 }}>{otherParty.name}</p>
            )}

            <StarRatingInput value={rating} onChange={setRating} />

            <div className="field-with-mic" style={{ marginTop: 16 }}>
              <textarea
                rows={3}
                placeholder={t("review_commentPlaceholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <MicButton lang={speechLang} onResult={(text) => setComment((prev) => `${prev} ${text}`.trim())} />
            </div>

            {reviewError && <p className="error-text">{reviewError}</p>}

            <button
              className="btn-primary"
              onClick={submitReview}
              disabled={submitting}
              style={{ width: "100%", marginTop: 8 }}
            >
              {submitting ? t("review_submitting") : t("review_submit")}
            </button>
          </div>
        )}

        {job.status === "completed" && (job.myReviewGiven || justSubmitted) && (
          <div className="card" style={{ textAlign: "center", color: "var(--KaamPaas-green)", fontWeight: 700 }}>
            {t("review_thanks")}
          </div>
        )}
      </div>
    </div>
  );
}
