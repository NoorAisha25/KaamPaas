import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { SPEECH_LANG_MAP } from "../constants";
import { parseSpokenPhone } from "../utils/parseSpokenPhone";
import AuthHeader from "../components/AuthHeader";
import MicButton from "../components/MicButton";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const speechLang = SPEECH_LANG_MAP[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setPhone("8000000001");
    setPassword("demo1234");
  };

  return (
    <div>
      <AuthHeader />
      <div className="container" style={{ maxWidth: 420, paddingTop: 32 }}>
        <h1 style={{ marginBottom: 4 }}>{t("login_title")}</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>{t("login_subtitle")}</p>

        <form onSubmit={handleSubmit} className="card">
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? t("loggingIn") : t("loginBtn")}
          </button>
          <button
            type="button"
            onClick={fillDemo}
            style={{ background: "none", border: "none", color: "var(--KaamPaas-blue)", marginTop: 12, fontSize: 13 }}
          >
            {t("useDemoLogin")}
          </button>
        </form>

        <p style={{ textAlign: "center" }}>
          {t("newHere")} <Link to="/register">{t("createAccountLink")}</Link>
        </p>
      </div>
    </div>
  );
}
