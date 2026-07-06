import { SKILLS } from "../constants";
import { useLanguage } from "../context/LanguageContext";
import { buildWhatsAppLink } from "../utils/whatsapp";
import Icon from "./Icon";

const RATE_UNIT_KEY = {
  day: "perDay",
  hour: "perHour",
  month: "perMonth",
};

export default function WorkerCard({ worker }) {
  const { t } = useLanguage();
  const skillMeta = SKILLS.find((s) => s.id === worker.skills?.[0]);
  const rateUnitKey = RATE_UNIT_KEY[worker.rateType] || "perDay";

  const whatsappMessage = skillMeta
    ? `${t("whatsapp_message")} (${t(`skill_${skillMeta.id}`)})`
    : t("whatsapp_message");

  return (
    <div className="worker-card">
      <img
        src={worker.profilePhotoUrl || `https://picsum.photos/seed/${worker._id || worker.name}/300/200`}
        alt={worker.name}
        className="worker-photo"
      />
      <div className="worker-name-row">
        {worker.name}
        {worker.isVerified && (
          <Icon name="checkCircle" size={16} className="verified-badge" style={{ color: "var(--KaamPaas-green)" }} />
        )}
      </div>
      <div className="worker-skill icon-btn">
        {skillMeta && <Icon name={skillMeta.icon} size={14} />}
        {skillMeta ? t(`skill_${skillMeta.id}`) : worker.skills?.[0]}
      </div>
      <div className="worker-meta">
        <span className="icon-btn">
          <Icon name="star" size={13} style={{ color: "#f59e0b" }} />
          {worker.ratingAvg?.toFixed(1) || "New"} ({worker.ratingCount || 0})
        </span>
        <span className="icon-btn">
          <Icon name="checkCircle" size={13} />
          {worker.jobsDone || 0} {t("jobsDone")}
        </span>
        <span className="icon-btn">
          <Icon name="mapPinSmall" size={13} />
          {worker.city}
        </span>
      </div>
      {typeof worker.trustScore === "number" && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>
            <span>Trust Score</span>
            <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>{worker.trustScore}/100</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "#f3f4f6", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${worker.trustScore}%`,
                background: worker.trustScore >= 70 ? "var(--KaamPaas-green)" : worker.trustScore >= 40 ? "var(--KaamPaas-orange)" : "#ef4444",
              }}
            />
          </div>
        </div>
      )}
      <div className="worker-footer" style={{ flexWrap: "wrap", gap: 8 }}>
        <div className="worker-rate">
          ₹{worker.dailyRate}
          <span>{t(rateUnitKey)}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={buildWhatsAppLink(worker.phone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-call icon-btn"
            style={{ background: "#25D366" }}
          >
            <Icon name="phone" size={15} />
            {t("whatsapp")}
          </a>
          <a href={`tel:${worker.phone}`} className="btn-call icon-btn">
            <Icon name="phone" size={15} />
            {t("call")}
          </a>
        </div>
      </div>
    </div>
  );
}
