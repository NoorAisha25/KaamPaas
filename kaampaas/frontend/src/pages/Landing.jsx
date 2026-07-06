import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES, SKILLS } from "../constants";
import Icon from "../components/Icon";

export default function Landing() {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div>
      <header className="navbar">
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="KaamPaas" className="navbar-logo" />
          <div className="navbar-brand-text">
            <div className="navbar-title">
              <span className="kaam">Kaam</span>
              <span className="paas">Paas</span>
            </div>
            <div className="navbar-tagline">Work Nearby. Hire Nearby.</div>
          </div>
        </Link>

        <nav className="navbar-links">
          {/* Language switcher - now present on the public landing page too, not just after login */}
          <div className="lang-switcher">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                className={lang === l.code ? "active" : ""}
                onClick={() => setLang(l.code)}
                title={l.code}
              >
                {l.label}
              </button>
            ))}
          </div>
          {user ? (
            <Link to="/dashboard">
              <button className="btn-dark" style={{ padding: "10px 20px" }}>
                {t("nav_dashboard")}
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login">{t("nav_login")}</Link>
              <Link to="/register">
                <button className="btn-dark" style={{ padding: "10px 20px" }}>
                  {t("nav_getStarted")}
                </button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <div className="container" style={{ paddingTop: 24 }}>
        <div className="hero">
          {/* ---- Left: copy ---- */}
          <div>
            <div className="hero-pill">
              <span className="dot" />
              {t("hero_pill")}
            </div>

            <h1 className="hero-heading">
              {t("hero_heading1")}
              <br />
              <span style={{ color: "var(--KaamPaas-orange)" }}>{t("hero_heading2")}</span>
            </h1>

            <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 480, marginTop: 20 }}>
              {t("hero_subtitle")}
            </p>

            <div style={{ display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" }}>
              <Link to="/register?role=worker">
                <button className="btn-primary icon-btn">
                  <Icon name="briefcase" size={18} />
                  {t("btn_iAmWorker")}
                  <Icon name="arrowRight" size={18} />
                </button>
              </Link>
              <Link to="/register?role=hirer">
                <button className="btn-dark icon-btn">
                  <Icon name="user" size={18} />
                  {t("btn_iNeedWorker")}
                  <Icon name="arrowRight" size={18} />
                </button>
              </Link>
            </div>

            <div className="trust-strip" style={{ marginTop: 24 }}>
              <span className="icon-btn"><Icon name="mic" size={16} /> {t("trust_speak")}</span>
              <span className="icon-btn"><Icon name="pin" size={16} /> {t("trust_languages")}</span>
              <span className="icon-btn"><Icon name="shield" size={16} /> {t("trust_encrypted")}</span>
            </div>
          </div>

          
          <div className="hero-media">
            <img
              className="hero-media-main"
              src="https://img.freepik.com/premium-photo/unity-construction-indian-workers-work-collaborative-indian-labor-joyful-indian-builders-white-background_995162-20760.jpg"
              alt="Local worker on a job site"
            />
            <div className="hero-rating-card">
              <Icon name="star" size={22} className="star-icon" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Locally</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Worker Near you</div>
              </div>
            </div>

            <div className="hero-media-grid">
                 <img src="https://tse3.mm.bing.net/th/id/OIP.nKb-Iji4UcL5uFdg1zzQLQHaE8?cb=thfvnextfalcon4&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Team of local workers" />
                 <img src="https://www.ft.com/__origami/service/image/v2/images/raw/https://d1e00ek4ebabms.cloudfront.net/production/792f287b-75e6-4994-85ff-38daa2f9886f.jpg?source=next-article&fit=scale-down&quality=highest&width=700&dpr=1" alt="Local worker at a shop" />
            </div>

            <div className="hero-verified-card">
              <Icon name="shield" size={20} style={{ color: "var(--KaamPaas-green)" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Verified</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Trust-first hiring</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Feature cards ---- */}
        <div className="feature-grid">
          <div className="card">
            <div className="feature-card-icon" style={{ background: "#fee7d6" }}>
              <Icon name="mic" size={22} style={{ color: "var(--KaamPaas-orange)" }} />
            </div>
            <h3 style={{ margin: "0 0 8px" }}>{t("feature_voiceFirst_title")}</h3>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>{t("feature_voiceFirst_desc")}</p>
          </div>
          <div className="card">
            <div className="feature-card-icon" style={{ background: "#d1fae5" }}>
              <Icon name="pin" size={22} style={{ color: "var(--KaamPaas-green)" }} />
            </div>
            <h3 style={{ margin: "0 0 8px" }}>{t("feature_trulyLocal_title")}</h3>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>{t("feature_trulyLocal_desc")}</p>
          </div>
          <div className="card">
            <div className="feature-card-icon" style={{ background: "#dbeafe" }}>
              <Icon name="shield" size={22} style={{ color: "var(--KaamPaas-blue)" }} />
            </div>
            <h3 style={{ margin: "0 0 8px" }}>{t("feature_encrypted_title")}</h3>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>{t("feature_encrypted_desc")}</p>
          </div>
        </div>

        
        <div className="trades-section">
          <div className="trades-header">
            <div>
              <div className="section-eyebrow">{t("trades_eyebrow")}</div>
              <h2 style={{ fontSize: 32, fontWeight: 800, margin: "6px 0 0" }}>{t("trades_title")}</h2>
            </div>
          </div>

          <div className="trade-grid">
            {SKILLS.map((skill) => (
              <div
                key={skill.id}
                className="trade-card"
                onClick={() => navigate(`/register?role=hirer&skill=${skill.id}`)}
              >
                <div className="trade-icon-badge">
                  <Icon name={skill.icon} size={26} style={{ color: "var(--KaamPaas-orange)" }} />
                </div>
                <div className="trade-card-label">{t(`skill_${skill.id}`)}</div>
              </div>
            ))}
          </div>
        </div>

        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
          <span>© 2026 KaamPaas · Work Nearby. Hire Nearby.</span>
          <span>Try demo → hirer: 8000000001 / demo1234</span>
        </footer>
      </div>
    </div>
  );
}
