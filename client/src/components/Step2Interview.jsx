import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ArrowRight, Bot, Radio, AlertCircle } from "lucide-react";
import axiosClient from "../utils/axiosClient";
import femaleVideo from "../assets/videos/female-ai.mp4";
import maleVideo from "../assets/videos/male-ai.mp4";
import Timmer from "./Timmer";
import VoiceVisualizer from "./VoiceVisualizer";

/* ─── Browser-compat: prefer unprefixed SpeechRecognition ─────────────────── */
const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

/* ─── Request mic permission up-front so mobile browsers don't block TTS ──── */
async function requestMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop tracks — we just need the permission grant
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch (err) {
    console.warn("[Mic] Permission denied or unavailable:", err.message);
    return false;
  }
}

/* ─── Robust voice-loading helper ─────────────────────────────────────────── */
function pickVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  if (!voices.length) return { voice: null, gender: "female" };

  const femaleVoice = voices.find(
    (v) =>
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("samantha") ||
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("victoria") ||
      v.name.toLowerCase().includes("karen")
  );
  if (femaleVoice) return { voice: femaleVoice, gender: "female" };

  const maleVoice = voices.find(
    (v) =>
      v.name.toLowerCase().includes("david") ||
      v.name.toLowerCase().includes("mark") ||
      v.name.toLowerCase().includes("male") ||
      v.name.toLowerCase().includes("daniel")
  );
  if (maleVoice) return { voice: maleVoice, gender: "male" };

  return { voice: voices[0] ?? null, gender: "female" };
}

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [micError, setMicError] = useState(""); // shown when mic/speech unavailable
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];
  const hasSpokenIntro = useRef(false);
  const lastSpokenIndex = useRef(-1);
  const isMicOnRef = useRef(isMicOn); // stable ref so closures don't stale

  // Keep ref in sync
  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  /* ── 1. Request mic permission on mount (mobile requirement) ───────────── */
  useEffect(() => {
    const init = async () => {
      console.log("[Interview] Requesting mic permission…");
      const granted = await requestMicPermission();
      setHasMicPermission(granted);
      if (!granted) {
        setMicError(
          "Microphone access was denied. You can still type your answers."
        );
        setIsMicOn(false);
        isMicOnRef.current = false;
      }
      console.log("[Interview] Mic permission:", granted ? "granted" : "denied");
    };
    init();
  }, []);

  /* ── 2. Load TTS voices — with mobile retry loop ───────────────────────── */
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // retry up to ~2 s

    const tryLoad = () => {
      const { voice, gender } = pickVoice();
      if (voice) {
        console.log("[TTS] Voice selected:", voice.name, gender);
        setSelectedVoice(voice);
        setVoiceGender(gender);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryLoad, 100);
      } else {
        // Still no voices — use null; speakText will resolve() gracefully
        console.warn("[TTS] No voices available on this device");
        setSelectedVoice(null);
        setVoiceGender("female");
      }
    };

    tryLoad();

    // Also listen for the event (required on some Android Chrome versions)
    const handler = () => {
      const { voice, gender } = pickVoice();
      if (voice) {
        setSelectedVoice(voice);
        setVoiceGender(gender);
      }
    };
    window.speechSynthesis?.addEventListener?.("voiceschanged", handler);
    return () =>
      window.speechSynthesis?.removeEventListener?.("voiceschanged", handler);
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /* ── 3. speakText — robust for mobile ─────────────────────────────────── */
  const speakText = useCallback(
    (text) => {
      return new Promise((resolve) => {
        if (!window.speechSynthesis) {
          // TTS not supported — skip silently
          resolve();
          return;
        }

        // Cancel any queued speech first
        try {
          window.speechSynthesis.cancel();
        } catch {}

        const humanText = text
          .replace(/,/g, ", ... ")
          .replace(/\./g, ". ... ");

        const utterance = new SpeechSynthesisUtterance(humanText);

        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsAIPlaying(true);
          stopMic();
          videoRef.current?.play().catch(() => {});
        };

        const onDone = () => {
          setIsAIPlaying(false);
          setSubtitle("");
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
          if (isMicOnRef.current) startMic();
          resolve();
        };

        utterance.onend = onDone;
        utterance.onerror = (e) => {
          console.warn("[TTS] Speech error:", e.error);
          onDone();
        };

        setSubtitle(text);

        try {
          window.speechSynthesis.speak(utterance);

          // Android Chrome bug: speech sometimes never fires onend if the
          // utterance is too long and synthesis gets paused by the OS.
          // Watchdog: resume every second while playing.
          const watchdog = setInterval(() => {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            if (!window.speechSynthesis.speaking) {
              clearInterval(watchdog);
            }
          }, 1000);

          // Clean up watchdog when utterance ends
          utterance.addEventListener("end", () => clearInterval(watchdog), {
            once: true,
          });
          utterance.addEventListener("error", () => clearInterval(watchdog), {
            once: true,
          });
        } catch (err) {
          console.warn("[TTS] speak() threw:", err);
          resolve();
        }
      });
    },
    [selectedVoice] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* ── 4. SpeechRecognition setup ─────────────────────────────────────────── */
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("[ASR] SpeechRecognition not supported on this browser");
      setMicError(
        "Voice input is not supported in this browser. Please type your answers."
      );
      setIsMicOn(false);
      isMicOnRef.current = false;
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.onerror = (e) => {
      console.warn("[ASR] Error:", e.error);
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setMicError(
          "Microphone access was denied. Please type your answers."
        );
        setIsMicOn(false);
        isMicOnRef.current = false;
      }
      // For "no-speech" and "aborted" we do nothing — these are transient
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
        recognition.abort();
      } catch {}
    };
  }, []);

  const startMic = () => {
    if (!recognitionRef.current || isAIPlaying || !isMicOnRef.current) return;
    try {
      recognitionRef.current.start();
    } catch {
      // Already started — ignore
    }
  };

  const stopMic = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  };

  const toggleMic = () => {
    if (!SpeechRecognitionAPI) {
      setMicError(
        "Voice input is not supported in this browser. Please type your answers."
      );
      return;
    }
    if (!hasMicPermission) {
      setMicError(
        "Microphone permission is required. Please allow access in your browser settings."
      );
      return;
    }
    const next = !isMicOn;
    isMicOnRef.current = next;
    setIsMicOn(next);
    if (next) startMic();
    else stopMic();
  };

  /* ── 5. Intro + question speech ─────────────────────────────────────────── */
  useEffect(() => {
    // selectedVoice may be null on devices without TTS — still allow proceeding
    const runIntro = async () => {
      if (isIntroPhase && !hasSpokenIntro.current) {
        hasSpokenIntro.current = true;
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );
        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );
        setIsIntroPhase(false);
      } else if (
        !isIntroPhase &&
        currentQuestion &&
        lastSpokenIndex.current !== currentIndex
      ) {
        lastSpokenIndex.current = currentIndex;
        await new Promise((r) => setTimeout(r, 800));
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }
        await speakText(currentQuestion.question);
        if (isMicOnRef.current) startMic();
      }
    };
    runIntro();
  }, [speakText, isIntroPhase, currentIndex, currentQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 6. Timer ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 7. Auto-submit on timeout ──────────────────────────────────────────── */
  useEffect(() => {
    if (isIntroPhase || !currentQuestion) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) submitAnswer();
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 8. Cleanup on unmount ──────────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      try { recognitionRef.current?.abort(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  /* ── Handlers ───────────────────────────────────────────────────────────── */
  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    try {
      // axiosClient attaches Authorization: Bearer header for mobile
      const result = await axiosClient.post(
        "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        }
      );
      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.error("[Submit Answer Error]", error?.response?.status, error?.response?.data);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }
    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOnRef.current) startMic();
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    isMicOnRef.current = false;
    try {
      // axiosClient attaches Authorization: Bearer header for mobile
      const result = await axiosClient.post(
        "/api/interview/finish",
        { interviewId }
      );
      onFinish(result.data);
    } catch (error) {
      console.error("[Finish Interview Error]", error?.response?.status, error?.response?.data);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F9FF] p-4 sm:p-6">
      <div className="flex w-full max-w-6xl min-h-[85vh] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] lg:flex-row">
        {/* ── AI panel ─────────────────────────────────────────────── */}
        <div className="flex w-full flex-col items-center border-b border-gray-100 bg-gradient-to-b from-blue-50/50 to-white p-6 lg:w-[38%] lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-[#2563EB]">
            <Bot size={16} />
            AI Interviewer
          </div>

          <div className="relative mb-4 w-full max-w-sm overflow-hidden rounded-2xl shadow-lg ring-2 ring-blue-100">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="aspect-video w-full object-cover"
            />
            {isAIPlaying && (
              <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[1px]" />
            )}
          </div>

          <VoiceVisualizer active={isAIPlaying} />

          <AnimatePresence>
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 w-full max-w-sm rounded-xl border border-blue-100 bg-white p-4 shadow-sm"
              >
                <p className="text-center text-sm leading-relaxed text-[#0F172A]">
                  {subtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mic error notice */}
          {micError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 w-full max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-3"
            >
              <p className="flex items-start gap-2 text-xs text-amber-700">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                {micError}
              </p>
            </motion.div>
          )}

          <div className="mt-6 w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Interview Status</span>
              {isAIPlaying && (
                <span className="flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
                  <Radio size={14} className="animate-pulse" />
                  AI Speaking
                </span>
              )}
            </div>
            <div className="flex justify-center py-2">
              <Timmer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-blue-50/50 py-3">
                <p className="text-2xl font-bold text-[#2563EB]">
                  {currentIndex + 1}
                </p>
                <p className="text-xs text-[#64748B]">Current</p>
              </div>
              <div className="rounded-xl bg-blue-50/50 py-3">
                <p className="text-2xl font-bold text-[#2563EB]">
                  {questions.length}
                </p>
                <p className="text-xs text-[#64748B]">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Answer panel ─────────────────────────────────────────── */}
        <div className="relative flex flex-1 flex-col p-6 sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-[#0F172A] sm:text-2xl">
            AI Smart <span className="text-[#2563EB]">Interview</span>
          </h2>

          {!isIntroPhase && (
            <div className="mb-6 rounded-2xl border border-gray-100 bg-[#F5F9FF] p-5">
              <p className="mb-2 text-xs font-medium text-[#64748B]">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <p className="text-base font-semibold leading-relaxed text-[#0F172A] sm:text-lg">
                {currentQuestion?.question}
              </p>
            </div>
          )}

          {isIntroPhase && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 p-8"
            >
              <p className="text-center text-[#64748B]">
                Preparing your interview session…
              </p>
            </motion.div>
          )}

          <textarea
            placeholder="Your answer will appear here as you speak or type…"
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="min-h-[180px] flex-1 resize-none rounded-2xl border border-gray-200 bg-[#F5F9FF] p-5 text-[#0F172A] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          {!feedback ? (
            <div className="mt-6 flex items-center gap-4">
              {/* Mic toggle — plain button for reliable mobile touch */}
              <button
                id="mic-toggle-btn"
                type="button"
                onClick={toggleMic}
                style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 ${
                  isMicOn
                    ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
                aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
              >
                {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
              </button>

              {/* Submit — plain button, touch-action: manipulation removes 300ms delay */}
              <button
                id="submit-answer-btn"
                type="button"
                onClick={submitAnswer}
                disabled={isSubmitting}
                style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                className="btn-primary flex-1 rounded-2xl py-4 disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {isSubmitting ? "Submitting…" : "Submit Answer"}
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5"
            >
              <p className="mb-4 font-medium text-[#2563EB]">{feedback}</p>
              <button
                id="next-question-btn"
                type="button"
                onClick={handleNext}
                style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl active:scale-[0.98]"
              >
                Next Question <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
