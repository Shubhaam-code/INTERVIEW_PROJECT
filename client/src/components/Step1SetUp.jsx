import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  MessageSquare,
  FileUp,
  Mic,
  BarChart2,
  UserCircle,
} from "lucide-react";
import axios from "axios";
import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../redux/userSlice";
import setupImg from "../assets/images/interviewboy.png";

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);

    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formdata,
        { withCredentials: true }
      );

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");
      setAnalysisDone(true);
      setAnalyzing(false);
    } catch (error) {
      console.log(error);
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true }
      );
      if (userData) {
        dispatch(
          setUserData({ ...userData, credits: result.data.creditsLeft })
        );
      }
      setLoading(false);
      onStart(result.data);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const featureCards = [
    { icon: UserCircle, text: "Choose Role & Experience" },
    { icon: Mic, text: "Smart Voice Interview" },
    { icon: BarChart2, text: "Performance Analytics" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex min-h-screen items-center justify-center bg-[#F5F9FF] px-4 py-10"
    >
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:grid-cols-2">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#F5F9FF] via-blue-50/40 to-white p-10 lg:p-12"
        >
          <div
            className="pointer-events-none absolute left-0 top-0 h-32 w-32 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(#2563EB 1px, transparent 1px)",
              backgroundSize: "12px 12px",
            }}
          />
          <div>
            <h2 className="text-3xl font-bold text-[#0F172A] lg:text-4xl">
              Start Your{" "}
              <span className="text-[#2563EB]">AI Interview</span>
            </h2>
            <p className="mt-4 max-w-md text-[#64748B]">
              Practice real interview scenarios powered by AI. Improve
              communication, technical skills, and confidence.
            </p>
            <div className="mt-8 space-y-3">
              {featureCards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.text}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                      <Icon size={20} />
                    </div>
                    <span className="font-medium text-[#0F172A]">
                      {item.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
          <div className="relative mt-8 flex items-center justify-center px-2 pb-2 pt-4">
            <div className="pointer-events-none absolute h-44 w-44 rounded-full bg-blue-400/20 blur-3xl" />
            <motion.img
              src={setupImg}
              alt="AI Interview"
              className="relative z-10 mx-auto h-auto w-full max-h-[300px] max-w-[440px] object-contain object-bottom drop-shadow-[0_16px_32px_rgba(37,99,235,0.15)] sm:max-h-[320px] lg:max-h-[340px]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="p-8 lg:p-12"
        >
          <h2 className="mb-8 text-2xl font-bold text-[#0F172A]">
            Interview <span className="text-[#2563EB]">SetUp</span>
          </h2>

          <div className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input
                type="text"
                placeholder="Job Role (e.g. Frontend Developer)"
                className="input-premium"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              />
            </div>

            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                className="input-premium"
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
              />
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#94A3B8]" size={18} />
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="input-premium appearance-none"
              >
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR Interview</option>
              </select>
            </div>

            {!analysisDone && (
              <motion.div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) setResumeFile(file);
                }}
                whileHover={{ scale: 1.01 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
                  dragOver
                    ? "border-[#2563EB] bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                <FileUp className="mx-auto mb-3 text-[#2563EB]" size={40} />
                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <p className="text-[#64748B]">
                  Click to upload{" "}
                  <span className="font-semibold text-[#2563EB]">Resume</span>{" "}
                  (Optional)
                </p>
                {resumeFile && (
                  <p className="mt-2 text-sm font-medium text-[#0F172A]">
                    {resumeFile.name}
                  </p>
                )}
                {resumeFile && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    className="mt-4 rounded-xl bg-[#0F172A] px-5 py-2 text-sm text-white"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-100 bg-[#F5F9FF] p-5 space-y-4"
              >
                <h3 className="font-semibold text-[#0F172A]">
                  Resume Analysis Result
                </h3>
                {projects.length > 0 && (
                  <div>
                    <p className="mb-1 font-medium text-[#64748B]">Projects:</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-[#0F172A]">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {skills.length > 0 && (
                  <div>
                    <p className="mb-2 font-medium text-[#64748B]">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-blue-50 px-3 py-1 text-sm text-[#2563EB]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <motion.button
              type="button"
              disabled={!role || !experience || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="btn-primary w-full rounded-2xl py-4 text-lg disabled:opacity-50"
            >
              {loading ? "Loading..." : "Start Interview"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step1SetUp;
