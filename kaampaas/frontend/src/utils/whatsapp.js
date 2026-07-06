// India country code assumed since phone numbers are stored as plain
// 10-digit local numbers. If you extend this app beyond India, store
// the country code alongside the phone number instead of hardcoding it.
const COUNTRY_CODE = "91";

export const buildWhatsAppLink = (phone, message) => {
  const digitsOnly = (phone || "").replace(/\D/g, "");
  const fullNumber = digitsOnly.startsWith(COUNTRY_CODE) ? digitsOnly : `${COUNTRY_CODE}${digitsOnly}`;
  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
};
