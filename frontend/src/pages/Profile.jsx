import { useEffect, useState } from "react";
import api from "../api/api";
import { useLanguage } from "../context/LanguageContext";
import { RATE_TYPES } from "../constants";
import Navbar from "../components/Navbar";
import SkillPicker from "../components/SkillPicker";
import PhotoUpload from "../components/PhotoUpload";
import Icon from "../components/Icon";

export default function Profile() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/users/me").then((res) => setProfile(res.data));
  }, []);

  const toggleAvailability = async () => {
    const { data } = await api.put("/users/me", { available: !profile.available });
    setProfile(data);
  };

  const updateSkills = async (skills) => {
    const { data } = await api.put("/users/me", { skills });
    setProfile(data);
  };

  const updateRateType = async (rateType) => {
    const { data } = await api.put("/users/me", { rateType });
    setProfile(data);
  };

  const updatePhoto = async (dataUrl) => {
    const { data } = await api.put("/users/me", { profilePhotoUrl: dataUrl });
    setProfile(data);
  };

  if (!profile) return <div className="container">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: 600 }}>
        {/* Photo upload works for both workers and hirers - the point is
            that each side can see who they're actually dealing with,
            not just a name and a number. */}
        <div className="card" style={{ marginBottom: 16 }}>
          <PhotoUpload currentUrl={profile.profilePhotoUrl} onUploaded={updatePhoto} />
        </div>

        <h1 style={{ marginBottom: 4 }}>{profile.name}</h1>
        <p style={{ color: "var(--text-muted)" }}>{profile.phone} · {profile.city}</p>

        <div className="card" style={{ marginBottom: 16 }}>
          <p className="icon-btn">
            <Icon name="star" size={16} style={{ color: "#f59e0b" }} />
            <strong>Rating:</strong> {profile.ratingAvg?.toFixed(1) || "No ratings yet"} ({profile.ratingCount})
          </p>
          <p className="icon-btn">
            <Icon name="checkCircle" size={16} />
            <strong>Jobs done:</strong> {profile.jobsDone}
          </p>

          {typeof profile.trustScore === "number" && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                <span>Trust Score</span>
                <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>{profile.trustScore}/100</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "#f3f4f6", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${profile.trustScore}%`,
                    background: profile.trustScore >= 70 ? "var(--KaamPaas-green)" : profile.trustScore >= 40 ? "var(--KaamPaas-orange)" : "#ef4444",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {profile.role === "worker" && (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <p><strong>Availability:</strong> {profile.available ? "Available today" : "Not available"}</p>
              <button className="btn-dark" onClick={toggleAvailability}>
                {profile.available ? "Mark as unavailable" : "Mark as available"}
              </button>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <p><strong>{t("label_rateType")}</strong></p>
              <div className="urgency-group" style={{ marginBottom: 12 }}>
                {RATE_TYPES.map((rt) => (
                  <div
                    key={rt.id}
                    className={`urgency-pill ${profile.rateType === rt.id ? "active" : ""}`}
                    onClick={() => updateRateType(rt.id)}
                  >
                    {t(rt.labelKey)}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>₹{profile.dailyRate}</p>
            </div>

            <div className="card">
              <p><strong>Your skills</strong></p>
              <SkillPicker selected={profile.skills || []} onChange={updateSkills} multi />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
