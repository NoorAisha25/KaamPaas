import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { SPEECH_LANG_MAP, RATE_TYPES } from "../constants";
import { parseSpokenPhone, parseSpokenNumber } from "../utils/parseSpokenPhone";
import { getPasswordStrength } from "../utils/passwordStrength";
import AuthHeader from "../components/AuthHeader";
import SkillPicker from "../components/SkillPicker";
import MicButton from "../components/MicButton";
import LocationInput from "../components/LocationInput";
import Icon from "../components/Icon";

const STRENGTH_COLOR = {
  weak: "#dc2626",
  medium: "#f59e0b",
  strong: "#16a34a",
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "hirer" ? "hirer" : "worker";
  const skillFromLanding = searchParams.get("skill"); // set when arriving via a "Skills near you" card click

  const { register } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const speechLang = SPEECH_LANG_MAP[lang];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [skills, setSkills] = useState([]);
  const [dailyRate, setDailyRate] = useState("");
  const [rateType, setRateType] = useState("day");
  const [locationData, setLocationData] = useState(null); // { label, lat, lng }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(password);
  const passwordMessageKey =
    passwordStrength === "strong" ? "passwordStrong" : passwordStrength === "medium" ? "passwordMedium" : "passwordWeak";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        phone,
        password,
        role,
        city: locationData?.label || "",
        skills: role === "worker" ? skills : undefined,
        dailyRate: role === "worker" ? Number(dailyRate) : undefined,
        rateType: role === "worker" ? rateType : undefined,
        location: locationData ? { type: "Point", coordinates: [locationData.lng, locationData.lat] } : undefined,
      });

      // If they clicked a specific skill card on the landing page (e.g.
      // "Plumber"), take them straight to Find Workers filtered to that
      // skill instead of a generic dashboard - closes the loop properly.
      if (role === "hirer" && skillFromLanding) {
        navigate(`/workers?skill=${skillFromLanding}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthHeader />
      <div className="container" style={{ maxWidth: 560, paddingTop: 32 }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, margin: "0 0 8px" }}>{t("register_title")}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 17, marginTop: 0 }}>{t("hero_subtitle")}</p>

        {/* ---- Big, simple, icon-based role cards - easier to tap and understand
             than a dropdown, especially for users who can't read the options ---- */}
        <div className="grid-2-responsive" style={{ marginBottom: 24 }}>
          <div
            className="card"
            onClick={() => setRole("worker")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderWidth: 2,
              borderColor: role === "worker" ? "var(--KaamPaas-orange)" : "var(--border)",
            }}
          >
            <div
              className="quick-action-icon"
              style={{ background: role === "worker" ? "var(--KaamPaas-orange)" : "#fee7d6", flexShrink: 0 }}
            >
              <Icon name="hardhat" size={22} style={{ color: role === "worker" ? "white" : "var(--KaamPaas-orange)" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>{t("role_worker_title")}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("role_worker_desc")}</div>
            </div>
          </div>

          <div
            className="card"
            onClick={() => setRole("hirer")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderWidth: 2,
              borderColor: role === "hirer" ? "var(--KaamPaas-orange)" : "var(--border)",
            }}
          >
            <div
              className="quick-action-icon"
              style={{ background: role === "hirer" ? "var(--KaamPaas-orange)" : "#fee7d6", flexShrink: 0 }}
            >
              <Icon name="briefcase" size={22} style={{ color: role === "hirer" ? "white" : "var(--KaamPaas-orange)" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>{t("role_hirer_title")}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{t("role_hirer_desc")}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="field-group">
            <label className="field-label">{t("label_name")}</label>
            <div className="field-with-mic">
              <input
                placeholder={t("placeholder_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <MicButton lang={speechLang} onResult={(text) => setName(text)} />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t("label_phone")}</label>
            <div className="field-with-mic">
              <input
                type="tel"
                placeholder={t("placeholder_phone")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <MicButton lang={speechLang} onResult={(text) => setPhone(parseSpokenPhone(text))} />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">{t("label_password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* No mic here on purpose - speaking a password out loud isn't private or reliable to transcribe */}
            {password.length > 0 && (
              <p style={{ fontSize: 13, marginTop: 6, marginBottom: 0, color: STRENGTH_COLOR[passwordStrength] || "var(--text-muted)", fontWeight: 600 }}>
                {t(passwordMessageKey)}
              </p>
            )}
          </div>

          <div className="field-group">
            <label className="field-label">{t("label_location")}</label>
            <LocationInput value={locationData?.label} onChange={setLocationData} placeholder={t("locationPlaceholder")} />
          </div>

          {role === "worker" && (
            <>
              <div className="field-group">
                <label className="field-label">{t("selectSkills")}</label>
                <SkillPicker selected={skills} onChange={setSkills} multi />
              </div>

              <div className="field-group">
                <label className="field-label">{t("label_rateType")}</label>
                <div className="urgency-group">
                  {RATE_TYPES.map((rt) => (
                    <div
                      key={rt.id}
                      className={`urgency-pill ${rateType === rt.id ? "active" : ""}`}
                      onClick={() => setRateType(rt.id)}
                    >
                      {t(rt.labelKey)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">{t("label_dailyRate")}</label>
                <div className="field-with-mic">
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    required
                  />
                  <MicButton lang={speechLang} onResult={(text) => setDailyRate(parseSpokenNumber(text))} />
                </div>
              </div>
            </>
          )}

          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? t("creatingAccount") : t("createAccountBtn")}
          </button>
        </form>

        <p style={{ textAlign: "center" }}>
          {t("alreadyHaveAccount")} <Link to="/login">{t("loginLink")}</Link>
        </p>
      </div>
    </div>
  );
}
