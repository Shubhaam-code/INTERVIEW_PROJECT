import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { motion } from "framer-motion";
import "react-circular-progressbar/dist/styles.css";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import { jsPDF } from "jspdf";
import DashboardLayout from "./layout/DashboardLayout";

function Step3Report({ report, embedded = false }) {
  const navigate = useNavigate();

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F9FF]">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg text-[#64748B]"
        >
          Loading Report...
        </motion.div>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Technical Knowledge", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;
    const primaryColor = [37, 99, 235];
    const darkTextColor = [15, 23, 42];
    const lightTextColor = [100, 116, 139];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...darkTextColor);
    doc.text("Interview Analytics Report", margin, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...lightTextColor);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, 210 - margin, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...darkTextColor);
    doc.text("Overall Performance", margin, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Overall Score: ${score}/10`, margin, y);
    y += 6;
    doc.text(`Evaluation: ${performanceText}`, margin, y);
    y += 6;
    doc.text(`Feedback: ${shortTagline}`, margin, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.text("Skill Evaluation", margin, y);
    y += 8;
    skills.forEach((skill) => {
      doc.text(`${skill.label}: ${skill.value}/10`, margin, y);
      y += 6;
    });
    y += 15;

    doc.text("Question Breakdown & Feedback", margin, y);
    y += 10;

    questionWiseScore.forEach((q, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      const questionLines = doc.splitTextToSize(
        `Q${index + 1}: ${q.question || "N/A"}`,
        210 - margin * 2
      );
      doc.text(questionLines, margin, y);
      y += questionLines.length * 6;
      doc.setTextColor(...primaryColor);
      doc.text(`Score: ${q.score ?? 0}/10`, margin, y);
      y += 6;
      doc.setTextColor(...lightTextColor);
      const feedbackLines = doc.splitTextToSize(
        `AI Feedback: ${q.feedback || "No feedback available."}`,
        210 - margin * 2 - 5
      );
      doc.text(feedbackLines, margin + 5, y);
      y += feedbackLines.length * 5 + 10;
    });

    doc.save(`Interview_Report_${report._id || "session"}.pdf`);
  };

  const content = (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="mt-1 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <ArrowLeft className="text-[#64748B]" size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Interview Analytics{" "}
              <span className="text-[#2563EB]">Dashboard</span>
            </h1>
            <p className="mt-1 text-[#64748B]">
              AI-powered performance insights
            </p>
          </div>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={handleDownloadPDF}
          className="btn-primary shrink-0"
        >
          <Download size={18} />
          Download PDF
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-8 text-center"
          >
            <h3 className="mb-6 text-sm font-medium text-[#64748B]">
              Overall Performance
            </h3>
            <div className="mx-auto h-40 w-40">
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textColor: "#0F172A",
                  pathColor: "#2563EB",
                  trailColor: "#E5E7EB",
                  textSize: "16px",
                })}
              />
            </div>
            <p className="mt-3 text-xs text-[#64748B]">Out of 10</p>
            <h4 className="mt-6 text-lg font-bold text-[#0F172A]">
              {performanceText}
            </h4>
            <p className="mt-2 text-sm text-[#64748B]">{shortTagline}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-8"
          >
            <h3 className="mb-6 text-center font-semibold text-[#0F172A]">
              Skill Evaluation
            </h3>
            <div className="space-y-5">
              {skills.map((s, i) => (
                <div key={i}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[#64748B]">{s.label}</span>
                    <span className="font-semibold text-[#2563EB]">
                      {s.value}/10
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value * 10}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-6 sm:p-8"
          >
            <h3 className="mb-6 font-semibold text-[#0F172A]">
              Performance Trend
            </h3>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <defs>
                    <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94A3B8" tickLine={false} />
                  <YAxis domain={[0, 10]} stroke="#94A3B8" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={3}
                    fill="url(#reportGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card-premium p-6 sm:p-8"
          >
            <h3 className="mb-6 font-semibold text-[#0F172A]">
              Question Breakdown
            </h3>
            <div className="space-y-5">
              {questionWiseScore.map((q, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 bg-[#F5F9FF]/50 p-5 sm:p-6"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <div>
                      <p className="text-xs text-[#64748B]">Question {i + 1}</p>
                      <p className="mt-1 font-semibold text-[#0F172A]">
                        {q.question || "Question not available"}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-blue-50 px-4 py-1 text-sm font-bold text-[#2563EB]">
                      {q.score ?? 0}/10
                    </span>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <p className="mb-1 text-xs font-semibold text-[#2563EB]">
                      AI Feedback
                    </p>
                    <p className="text-sm leading-relaxed text-[#0F172A]">
                      {q.feedback?.trim()
                        ? q.feedback
                        : "No feedback available for this question."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <DashboardLayout activeNav="analytics" showSidebar={true}>
      {content}
    </DashboardLayout>
  );
}

export default Step3Report;
