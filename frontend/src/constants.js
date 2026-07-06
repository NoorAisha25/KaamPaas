// Matches the exact skill grid order shown in the KaamPaas screenshots
// (Post a Job / Find Workers pages).
export const SKILLS = [
  { id: "plumber", label: "Plumber", icon: "wrench" },
  { id: "electrician", label: "Electrician", icon: "bolt" },
  { id: "painter", label: "Painter", icon: "brush" },
  { id: "mason", label: "Mason", icon: "brick" },
  { id: "carpenter", label: "Carpenter", icon: "saw" },
  { id: "home_cleaner", label: "Home Cleaner", icon: "sparkles" },
  { id: "sweeper", label: "Sweeper", icon: "trash" },
  { id: "embroider", label: "Embroider", icon: "scissors" },
  { id: "labour", label: "Labour", icon: "users" },
  { id: "gardener", label: "Gardener", icon: "leaf" },
  { id: "cook", label: "Cook", icon: "utensils" },
  { id: "driver", label: "Driver", icon: "car" },
];

export const LANGUAGES = [
  { code: "en", label: "A" },
  { code: "hi", label: "अ" },
  { code: "mr", label: "म" },
  { code: "ta", label: "த" },
  { code: "bn", label: "ব" },
];

// Maps the UI language code to a Web Speech API locale, so the mic
// listens in whichever language the person has selected - critical for
// low-literacy users who need to speak in their own language, not English.
export const SPEECH_LANG_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  bn: "bn-IN",
};

// Rate type options for worker registration/profile - lets a worker say
// whether their rate is per day, per hour, or per month (e.g. an
// embroiderer often works monthly, a cleaner often works hourly).
export const RATE_TYPES = [
  { id: "day", labelKey: "rateType_day" },
  { id: "hour", labelKey: "rateType_hour" },
  { id: "month", labelKey: "rateType_month" },
];
