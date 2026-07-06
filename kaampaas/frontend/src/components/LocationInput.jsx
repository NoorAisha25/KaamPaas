import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getCurrentCoords } from "../utils/geolocation";
import Icon from "./Icon";

// Uses OpenStreetMap's Nominatim - a free, no-API-key geocoding service.
// Good enough for a project at this scale. Its fair-use policy asks for
// max ~1 request/second, hence the debounce below. For a production app
// with real traffic, swap this for Google Places or Mapbox (paid, but
// much higher rate limits and better address coverage).
export default function LocationInput({ value, onChange, placeholder }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const searchAddress = (text) => {
    clearTimeout(debounceRef.current);
    if (!text || text.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=5&countrycodes=in`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 600); // stays polite to Nominatim's free-tier rate limit
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setShowSuggestions(true);
    searchAddress(text);
  };

  const selectSuggestion = (item) => {
    setQuery(item.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    onChange({
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const coords = await getCurrentCoords();
      if (!coords) {
        setLocating(false);
        return;
      }
      // Reverse-geocode the coordinates into a human-readable address
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`
      );
      const data = await res.json();
      const label = data.display_name || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
      setQuery(label);
      onChange({ label, lat: coords.lat, lng: coords.lng });
    } catch (err) {
      // fail silently - person can still type an address manually
    } finally {
      setLocating(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          title={t("useCurrentLocation")}
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: 10,
            border: "1.5px solid var(--border)",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="pin" size={18} style={{ color: "var(--KaamPaas-orange)" }} />
        </button>
      </div>

      {showSuggestions && (loading || suggestions.length > 0) && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 54,
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 10,
            marginTop: 4,
            zIndex: 20,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {loading && <div style={{ padding: 12, fontSize: 13, color: "var(--text-muted)" }}>...</div>}
          {suggestions.map((item) => (
            <div
              key={item.place_id}
              onClick={() => selectSuggestion(item)}
              style={{
                padding: "10px 14px",
                fontSize: 14,
                cursor: "pointer",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {item.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
