import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ArrowRight, Bot, Radio } from "lucide-react";
import axios from "axios";
import { ServerUrl } from "../App";
import femaleVideo from "../assets/videos/female-ai.mp4";
import maleVideo from "../assets/videos/male-ai.mp4";
import Timmer from "./Timmer";
import VoiceVisualizer from "./VoiceVisualizer";

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
  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];
  const hasSpokenIntro = useRef(false);
  const lastSpokenIndex = useRef(-1);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };
      utterance.onend = () => {
        setIsAIPlaying(false);
        setSubtitle("");
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        resolve();
      };

      if (isMicOn) {
        startMic();
      }

      utterance.onerror = () => {
        setIsAIPlaying(false);
        setSubtitle("");
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        resolve();
      };
      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) return;
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
        if (isMicOn) startMic();
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex, currentQuestion]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
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
  }, [isIntroPhase, currentIndex]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };
    recognitionRef.current = recognition;
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const toggleMic = () => {
    if (isMicOn) stopMic();
    else startMic();
    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true }
      );
      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
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
      if (isMicOn) startMic();
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );
      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) submitAnswer();
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F9FF] p-4 sm:p-6">
      <div className="flex w-full max-w-6xl min-h-[85vh] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] lg:flex-row">
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
                Preparing your interview session...
              </p>
            </motion.div>
          )}

          <textarea
            placeholder="Your answer will appear here as you speak or type..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="min-h-[180px] flex-1 resize-none rounded-2xl border border-gray-200 bg-[#F5F9FF] p-5 text-[#0F172A] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          {!feedback ? (
            <div className="mt-6 flex items-center gap-4">
              <motion.button
                type="button"
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition ${
                  isMicOn
                    ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
              </motion.button>
              <motion.button
                type="button"
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1 rounded-2xl py-4 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5"
            >
              <p className="mb-4 font-medium text-[#2563EB]">{feedback}</p>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl"
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
