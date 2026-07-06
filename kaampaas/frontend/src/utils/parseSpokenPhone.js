// Best-effort conversion of a spoken phone number into digits.
// Most browsers already transcribe spoken digits as numerals (e.g. saying
// "nine eight seven six" often comes back as "9876"), but as a fallback
// for locales/browsers that transcribe number WORDS instead, this maps
// common single-digit words in each supported language to their digit.
const WORD_TO_DIGIT = {
  // English
  zero: "0", one: "1", two: "2", three: "3", four: "4",
  five: "5", six: "6", seven: "7", eight: "8", nine: "9",
  // Hindi
  शून्य: "0", एक: "1", दो: "2", तीन: "3", चार: "4",
  पांच: "5", छह: "6", छः: "6", सात: "7", आठ: "8", नौ: "9",
  // Marathi
  शून्य: "0", एक: "1", दोन: "2", तीन: "3", चार: "4",
  पाच: "5", सहा: "6", सात: "7", आठ: "8", नऊ: "9",
  // Tamil
  பூஜ்யம்: "0", ஒன்று: "1", இரண்டு: "2", மூன்று: "3", நான்கு: "4",
  ஐந்து: "5", ஆறு: "6", ஏழு: "7", எட்டு: "8", ஒன்பது: "9",
  // Bengali
  শূন্য: "0", এক: "1", দুই: "2", তিন: "3", চার: "4",
  পাঁচ: "5", ছয়: "6", সাত: "7", আট: "8", নয়: "9",
};

export const parseSpokenPhone = (transcript) => {
  // First try: the transcript already contains digit characters
  const digitsOnly = transcript.replace(/\D/g, "");
  if (digitsOnly.length >= 10) return digitsOnly.slice(0, 10);

  // Fallback: transcript came back as spoken number words - map word by word
  const words = transcript.trim().split(/\s+/);
  const converted = words
    .map((w) => WORD_TO_DIGIT[w.toLowerCase()] ?? WORD_TO_DIGIT[w] ?? "")
    .join("");

  // Prefer whichever attempt produced more digits
  return (converted.length > digitsOnly.length ? converted : digitsOnly).slice(0, 10);
};

// Same logic as parseSpokenPhone but without the 10-digit cap - use this
// for amount fields like Daily Rate or Budget (e.g. "six hundred" -> best
// effort falls back to plain digit extraction; browsers usually already
// transcribe spoken amounts as numerals like "600").
export const parseSpokenNumber = (transcript) => {
  const digitsOnly = transcript.replace(/\D/g, "");
  if (digitsOnly.length > 0) return digitsOnly;

  const words = transcript.trim().split(/\s+/);
  const converted = words
    .map((w) => WORD_TO_DIGIT[w.toLowerCase()] ?? WORD_TO_DIGIT[w] ?? "")
    .join("");
  return converted;
};
