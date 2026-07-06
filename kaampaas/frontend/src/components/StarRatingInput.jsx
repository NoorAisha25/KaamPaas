import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import Icon from "./Icon";

export default function StarRatingInput({ value, onChange }) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: "none",
              border: "none",
              padding: 8,
              cursor: "pointer",
              display: "flex",
              minWidth: 48,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={`${n} star`}
          >
            <Icon
              name="star"
              size={36}
              style={{ color: n <= active ? "#f59e0b" : "#e5e7eb" }}
            />
          </button>
        ))}
      </div>

      {/* Plain-language label instead of relying on the person reading a
          number - "5/5" means little if you don't read numbers fluently,
          but a word like "Excellent" in your own language is immediate. */}
      {active > 0 && (
        <p style={{ fontWeight: 700, fontSize: 16, marginTop: 4, color: "var(--text-dark)" }}>
          {t(`rating_label_${active}`)}
        </p>
      )}
    </div>
  );
}
