import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useLanguage } from "../context/LanguageContext";
import { SPEECH_LANG_MAP, RATE_TYPES } from "../constants";
import Navbar from "../components/Navbar";
import SkillPicker from "../components/SkillPicker";
import MicButton from "../components/MicButton";
import LocationInput from "../components/LocationInput";

export default function PostJob() {
  const { t, lang } = useLanguage();
  const speechLang = SPEECH_LANG_MAP[lang];
  const [skill, setSkill] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetType, setBudgetType] = useState("day");
  const [locationData, setLocationData] = useState(null); // { label, lat, lng }
  const [urgency, setUrgency] = useState("normal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!skill) {
      setError("Please choose a skill");
      return;
    }
    if (!locationData) {
      setError("Please choose a location");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/jobs", {
        skill,
        title,
        description,
        budget: Number(budget),
        budgetType,
        city: locationData.label,
        urgency,
        location: { type: "Point", coordinates: [locationData.lng, locationData.lat] },
      });
      navigate(`/jobs/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="section-eyebrow">{t("postJob_eyebrow")}</div>
        <h1 className="section-title">{t("postJob_title")}</h1>

        <form onSubmit={handleSubmit} className="card">
          <label className="field-label">{t("chooseSkill")}</label>
          <SkillPicker selected={skill} onChange={setSkill} />

          <div className="field-group">
            <label className="field-label">{t("jobTitle")}</label>
            <div className="field-with-mic">
              <input
                placeholder={t("jobTitlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <MicButton lang={speechLang} onResult={(text) => setTitle(text)} />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t("describeWork")}</label>
            <div className="field-with-mic">
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <MicButton lang={speechLang} onResult={(text) => setDescription((prev) => `${prev} ${text}`.trim())} />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t("label_location")}</label>
            <LocationInput
              value={locationData?.label}
              onChange={setLocationData}
              placeholder={t("locationPlaceholder")}
            />
          </div>

          <div className="field-group">
            <label className="field-label">{t("budget")}</label>
            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          </div>

          <div className="field-group">
            <label className="field-label">{t("label_budgetType")}</label>
            <div className="urgency-group">
              {RATE_TYPES.map((rt) => (
                <div
                  key={rt.id}
                  className={`urgency-pill ${budgetType === rt.id ? "active" : ""}`}
                  onClick={() => setBudgetType(rt.id)}
                >
                  {t(rt.labelKey)}
                </div>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t("urgency")}</label>
            <div className="urgency-group">
              {[
                { key: "normal", label: t("urgency_normal") },
                { key: "today", label: t("urgency_today") },
                { key: "urgent", label: t("urgency_urgent") },
              ].map((u) => (
                <div
                  key={u.key}
                  className={`urgency-pill ${urgency === u.key ? "active" : ""}`}
                  onClick={() => setUrgency(u.key)}
                >
                  {u.label}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? t("posting") : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
