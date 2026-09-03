import { useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { resizeImageFile } from "../utils/resizeImage";
import { uploadToCloudinary } from "../utils/cloudinary";
import Icon from "./Icon";

export default function PhotoUpload({ currentUrl, onUploaded, size = 96 }) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const { dataUrl, blob } = await resizeImageFile(file);
      setPreview(dataUrl);

      const cloudinaryUrl = await uploadToCloudinary(blob);
      await onUploaded(cloudinaryUrl);
    } catch (err) {
      setError(t("photoUploadError"));
    } finally {
      setUploading(false);
      e.target.value = ""; // allows re-selecting the same file if needed
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          background: "#f3f4f6",
          border: "2px solid var(--border)",
          flexShrink: 0,
        }}
      >
        {preview ? (
          <img src={preview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={size * 0.4} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px 0",
          }}
        >
          <Icon name="plus" size={14} style={{ color: "white" }} />
        </div>
      </div>

      <div>
        <button type="button" className="btn-dark" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "..." : preview ? t("changePhoto") : t("addPhoto")}
        </button>
        {error && <p className="error-text" style={{ marginTop: 8, marginBottom: 0 }}>{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
