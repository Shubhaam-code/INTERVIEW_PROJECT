import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import {
  Play,
  Clock,
  User,
  Mic,
  BarChart2,
  FileText,
  Download,
  History,
  Users,
  Code2,
  Volume2,
  Coins,
  Brain,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import DashboardLayout from "../components/layout/DashboardLayout";
import AuthModel from "../components/AuthModel";
import Footer from "../components/Footer";

import heroImg from "../assets/images/boy.png";
import evalImg from "../assets/images/ai-ans.png";
import resumeImg from "../assets/images/resume.png";
import pdfImg from "../assets/images/pdf.png";
import analyticsImg from "../assets/images/history.png";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const trendData = [
  { day: "Mon", score: 7.2 },
  { day: "Tue", score: 7.8 },
  { day: "Wed", score: 8.1 },
  { day: "Thu", score: 7.5 },
  { day: "Fri", score: 8.4 },
  { day: "Sat", score: 8.9 },
  { day: "Sun", score: 8.5 },
];

const questionBreakdown = [
  { name: "Easy", value: 45, color: "#22C55E" },
  { name: "Medium", value: 50, color: "#2563EB" },
  { name: "Hard", value: 25, color: "#F97316" },
];

const interviewModes = [
  {
    icon: Users,
    title: "HR Interview Mode",
    desc: "Behavioral and communication based evaluation.",
  },
  {
    icon: Code2,
    title: "Technical Mode",
    desc: "Deep technical questioning based on role.",
  },
  {
    icon: Mic,
    title: "Smart Voice Interview",
    desc: "Dynamic AI voice follow-up questions.",
  },
  {
    icon: Volume2,
    title: "Confidence Detection",
    desc: "Tone and voice confidence analysis.",
  },
  {
    icon: Coins,
    title: "Credits System",
    desc: "Unlock premium interview sessions.",
  },
  {
    icon: Brain,
    title: "AI Performance Review",
    desc: "Detailed AI feedback and scoring.",
  },
];

const aiFeatures = [
  {
    icon: BarChart2,
    title: "AI Answer Evaluation",
    desc: "Scores communication, technical accuracy and confidence.",
    image: evalImg,
  },
  {
    icon: FileText,
    title: "Resume Based Interview",
    desc: "Project-specific questions from your resume.",
    image: resumeImg,
  },
  {
    icon: Download,
    title: "Downloadable Report",
    desc: "Strengths, weaknesses and improvement insights.",
    image: pdfImg,
  },
  {
    icon: History,
    title: "History & Analytics",
    desc: "Track progress with performance graphs.",
    image: analyticsImg,
  },
];

const processSteps = [
  {
    step: "STEP 1",
    icon: User,
    title: "Role & Experience Selection",
    desc: "AI adjusts difficulty based on your job role.",
  },
  {
    step: "STEP 2",
    icon: Mic,
    title: "Smart Voice Interview",
    desc: "Dynamic follow-up questions based on answers.",
  },
  {
    step: "STEP 3",
    icon: BarChart2,
    title: "AI Performance Review",
    desc: "Comprehensive scoring and skill breakdown.",
  },
];

const skillBars = [
  { label: "Confidence", value: 82 },
  { label: "Communication", value: 88 },
  { label: "Technical Knowledge", value: 75 },
  { label: "Problem Solving", value: 80 },
];

function Home() {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;
    const fetchInterviews = async () => {
      try {
        // axiosClient sends Authorization: Bearer header for mobile
        const result = await axiosClient.get("/api/interview/get-interview");
        setInterviews(result.data.interview || []);
      } catch (error) {
        console.error("[Home] Fetch interviews error:", error?.response?.status);
      }
    };
    fetchInterviews();
  }, [userData]);

  const requireAuth = (path) => {
    if (!userData) {
      setShowAuth(true);
      return;
    }
    navigate(path);
  };

  const completed = interviews.filter(
    (i) => i.status?.toLowerCase() === "completed"
  ).length;
  const avgScore =
    interviews.length > 0
      ? (
          interviews.reduce((a, b) => a + (b.final || 0), 0) / interviews.length
        ).toFixed(1)
      : "8.5";
  const displayScore = interviews.length > 0 ? avgScore : "8.5";

  return (
    <DashboardLayout activeNav="home">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Hero */}
        <motion.section
          {...fadeUp}
          className="card-premium grid overflow-hidden lg:grid-cols-2"
        >
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-[#2563EB]">
              AI Powered Smart Interview Platform
            </span>
            <h1 className="text-3xl font-bold leading-tight text-[#0F172A] sm:text-4xl lg:text-[2.5rem]">
              Practice Interviews with{" "}
              <span className="gradient-text">AI Intelligence</span>
            </h1>
            <p className="mt-4 max-w-lg text-[#64748B]">
              Role-based mock interviews with smart follow-ups, adaptive
              difficulty and real-time performance evaluation.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => requireAuth("/interview")}
                className="btn-primary"
              >
                <Play size={18} fill="white" />
                Start Interview
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => requireAuth("/history")}
                className="btn-secondary"
              >
                <Clock size={18} />
                View History
              </motion.button>
            </div>
          </div>
          <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50/80 to-white p-6 sm:p-8 lg:min-h-[380px] lg:p-10">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
            </div>
            <div className="absolute left-6 top-6 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl" />
            <div className="absolute bottom-8 right-8 h-28 w-28 rounded-full bg-blue-500/15 blur-3xl" />
            <motion.img
              src={heroImg}
              alt="AI Interview Practice"
              className="relative z-10 mx-auto h-auto w-full max-h-[300px] max-w-[420px] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(37,99,235,0.18)] sm:max-h-[340px] lg:max-h-[360px]"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.section>

        {/* AI Features + Performance row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.section
            id="features"
            {...fadeUp}
            className="card-premium lg:col-span-2 p-6 lg:p-8"
          >
            <h2 className="mb-6 text-xl font-bold text-[#0F172A]">
              Advanced AI <span className="text-[#2563EB]">Capabilities</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {aiFeatures.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-[#F5F9FF]/50 p-4 transition duration-300 hover:shadow-md"
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="h-16 w-16 shrink-0 object-contain"
                    />
                    <div>
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                        <Icon size={18} />
                      </div>
                      <h3 className="font-semibold text-[#0F172A]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#64748B]">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          <motion.section
            id="analytics"
            {...fadeUp}
            className="card-premium p-6"
          >
            <h2 className="mb-4 text-lg font-bold text-[#0F172A]">
              Overall Performance
            </h2>
            <div className="flex items-center gap-6">
              <div className="h-28 w-28 shrink-0">
                <CircularProgressbar
                  value={(Number(displayScore) / 10) * 100}
                  text={`${displayScore}/10`}
                  styles={buildStyles({
                    pathColor: "#2563EB",
                    textColor: "#0F172A",
                    trailColor: "#E5E7EB",
                    textSize: "14px",
                  })}
                />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Total Interviews</span>
                  <span className="font-semibold">{interviews.length || 24}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Completed</span>
                  <span className="font-semibold">{completed || 18}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Avg. Score</span>
                  <span className="font-semibold text-[#2563EB]">
                    {displayScore}/10
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-sm font-medium text-[#2563EB]">
              Good Performance
            </p>
          </motion.section>
        </div>

        {/* Interview Modes */}
        <motion.section id="modes" {...fadeUp} className="card-premium p-6 lg:p-8">
          <h2 className="mb-6 text-xl font-bold text-[#0F172A]">
            Multiple Interview <span className="text-[#2563EB]">Mode</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {interviewModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm transition duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#0F172A]">
                    {mode.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                    {mode.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Process steps */}
        <motion.section {...fadeUp} className="card-premium p-6 lg:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
            {processSteps.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.step}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="relative flex-1 rounded-2xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-6 text-center"
                  >
                    <span className="text-xs font-bold tracking-wider text-[#2563EB]">
                      {item.step}
                    </span>
                    <div className="mx-auto my-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#2563EB]">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-semibold text-[#0F172A]">{item.title}</h3>
                    <p className="mt-2 text-sm text-[#64748B]">{item.desc}</p>
                  </motion.div>
                  {index < 2 && (
                    <div className="hidden shrink-0 items-center md:flex">
                      <ArrowRight className="text-blue-300" size={28} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.section>

        {/* History + Trend + Skills */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.section {...fadeUp} className="card-premium lg:col-span-1 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A]">
                Interview History
              </h2>
              <button
                type="button"
                onClick={() => requireAuth("/history")}
                className="text-sm font-medium text-[#2563EB] hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {(interviews.length > 0
                ? interviews.slice(0, 4)
                : [
                    {
                      role: "Frontend Developer Interview",
                      mode: "Technical",
                      final: 8.5,
                      status: "completed",
                      createdAt: new Date(),
                    },
                    {
                      role: "HR Behavioral Interview",
                      mode: "HR",
                      final: 7.2,
                      status: "incomplete",
                      createdAt: new Date(),
                    },
                  ]
              ).map((item, index) => {
                const isDone =
                  item.status?.toLowerCase() === "completed" || item.final > 0;
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!item._id) return;
                      if (!userData) {
                        setShowAuth(true);
                        return;
                      }
                      navigate(`/report/${item._id}`);
                    }}
                    className={`flex items-center justify-between rounded-xl border border-gray-100 p-4 transition ${
                      item._id ? "cursor-pointer hover:bg-blue-50/30" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium capitalize text-[#0F172A]">
                        {item.role}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {item.mode} •{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#2563EB]">
                        {item.final ? `${Math.round(item.final)}/10` : "—"}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          isDone
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {isDone ? "Completed" : "Incomplete"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          <motion.section {...fadeUp} className="card-premium p-6 lg:col-span-1">
            <h2 className="mb-4 text-lg font-bold text-[#0F172A]">
              Performance Trend
            </h2>
            <p className="mb-4 text-xs text-[#64748B]">Last 7 Days</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis domain={[6, 10]} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fill="url(#blueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section
            id="settings"
            {...fadeUp}
            className="card-premium space-y-6 p-6 lg:col-span-1"
          >
            <div>
              <h2 className="mb-4 text-lg font-bold text-[#0F172A]">
                Skill Evaluation
              </h2>
              <div className="space-y-4">
                {skillBars.map((s) => (
                  <div key={s.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-[#64748B]">{s.label}</span>
                      <span className="font-semibold text-[#2563EB]">
                        {s.value}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.value}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-4 text-lg font-bold text-[#0F172A]">
                Question Breakdown
              </h2>
              <div className="flex items-center gap-4">
                <div className="h-32 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={questionBreakdown}
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {questionBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A]">120</p>
                  <p className="text-xs text-[#64748B]">Total Questions</p>
                  <div className="mt-3 space-y-1 text-xs">
                    {questionBreakdown.map((q) => (
                      <div key={q.name} className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: q.color }}
                        />
                        {q.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </DashboardLayout>
  );
}

export default Home;
