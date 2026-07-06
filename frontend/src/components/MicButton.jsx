import { useRef, useState } from "react";
import Icon from "./Icon";

const FRIENDLY_ERRORS = {
  "not-allowed": "Microphone access was blocked. Please allow microphone access in your browser and try again.",
  "no-speech": "Didn't hear anything. Please try again.",
  "audio-capture": "No microphone was found on this device.",
  "language-not-supported": "Voice input isn't available in this language on your device. Try English instead.",
  network: "Voice input needs an internet connection.",
};

// Uses the browser's built-in Web Speech API - free, zero backend cost.
// Works in Chrome/Edge on desktop and Android. Requires HTTPS or
// localhost (browsers block microphone access on plain HTTP).
export default function MicButton({ onResult, lang = "en-IN" }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const startListening = () => {
    setError("");

    if (!window.isSecureContext) {
      setError("Voice input only works on a secure (https) connection or localhost.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }

    // If a previous session is somehow still active, stop it first -
    // calling start() while already running throws a synchronous error
    // that (if uncaught) makes the button look completely unresponsive.
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {
        /* ignore - nothing to abort */
      }
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = (event) => {
      setError(FRIENDLY_ERRORS[event.error] || "Voice input didn't work. Please try again.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      // This catches the "already started" InvalidStateError and any
      // other synchronous failure, so a fast double-click never leaves
      // the button silently dead.
      setError("Voice input didn't start. Please try again.");
      setListening(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn-mic"
        onClick={startListening}
        title="Speak instead of typing"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: listening ? "KaamPaas-pulse 1s ease-in-out infinite" : "none",
        }}
      >
        <Icon name="mic" size={18} style={{ color: "white" }} />
      </button>
      {error && <p className="error-text" style={{ maxWidth: 220 }}>{error}</p>}
    </>
  );
}
