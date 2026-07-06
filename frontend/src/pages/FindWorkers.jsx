import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";
import { useLanguage } from "../context/LanguageContext";
import { getCurrentCoords } from "../utils/geolocation";
import Navbar from "../components/Navbar";
import SkillPillBar from "../components/SkillPillBar";
import WorkerCard from "../components/WorkerCard";

export default function FindWorkers() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [skill, setSkill] = useState(searchParams.get("skill") || "all");
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState(null);
  const [locationChecked, setLocationChecked] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ask for GPS location once when the page loads - same pattern as
  // opening Uber/Swiggy. Fails silently and falls back to city text.
  useEffect(() => {
    getCurrentCoords().then((c) => {
      setCoords(c);
      setLocationChecked(true);
    });
  }, []);

  const fetchWorkers = () => {
    setLoading(true);
    api
      .get("/users/workers", {
        params: {
          skill,
          city: coords ? undefined : city, // prefer real GPS over typed city when available
          lng: coords?.lng,
          lat: coords?.lat,
        },
      })
      .then((res) => setWorkers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!locationChecked) return; // wait for the geolocation attempt to resolve first
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill, locationChecked]);

  // Debounce city typing so we don't fire a request per keystroke
  // (only matters when GPS wasn't available, so city text drives search)
  useEffect(() => {
    if (!locationChecked || coords) return;
    const timeout = setTimeout(fetchWorkers, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="section-eyebrow">{t("browse_eyebrow")}</div>
        <h1 className="section-title">{t("findWorkers_title")}</h1>

        <p style={{ color: coords ? "var(--KaamPaas-green)" : "var(--text-muted)", fontSize: 13, fontWeight: 600, marginTop: -8, marginBottom: 16 }}>
          {locationChecked ? (coords ? t("usingYourLocation") : t("locationDenied")) : ""}
        </p>

        <SkillPillBar selected={skill} onChange={setSkill} />

        {!coords && (
          <input
            placeholder={t("cityPlaceholder")}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ maxWidth: 400, marginBottom: 24 }}
          />
        )}

        {loading && <p>Loading...</p>}
        {!loading && workers.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>{t("noWorkersFound")}</p>
        )}

        <div className="worker-grid">
          {workers.map((w) => (
            <WorkerCard key={w._id} worker={w} />
          ))}
        </div>
      </div>
    </div>
  );
}
