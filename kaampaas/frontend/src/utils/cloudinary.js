// Uploads an image blob directly to Cloudinary from the browser, using
// an UNSIGNED upload preset - this is safe to call from client-side code
// because it never needs your Cloudinary API secret, only the public
// cloud name and preset name (both fine to expose in frontend code).
//
// Requires these two values in frontend/.env:
//   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
//   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
export const uploadToCloudinary = async (blob) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary isn't configured - add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to frontend/.env"
    );
  }

  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url; // short HTTPS URL - this is what gets stored on the User document
};
