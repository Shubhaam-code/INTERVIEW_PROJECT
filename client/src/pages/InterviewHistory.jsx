import React, { useEffect, useState } from "react";
import { ServerUrl } from "../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/get-interview",
          { withCredentials: true }
        );
        setInterviews(result.data.interview || []);
      } catch (error) {
        console.log(error);
      }
    };
    getMyInterviews();
  }, []);

  return (
    <DashboardLayout activeNav="history">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-1 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="text-[#64748B]" size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Interview <span className="text-[#2563EB]">History</span>
            </h1>
            <p className="mt-2 text-[#64748B]">
              Track your past interviews and performance
            </p>
          </div>
        </div>

        {interviews.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <p className="text-[#64748B]">
              No interviews found. Start your first interview.
            </p>
            <button
              type="button"
              onClick={() => navigate("/interview")}
              className="btn-primary mt-6"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((item, index) => {
              const displayMode =
                item.mode &&
                (item.mode.toLowerCase() === "techinal" ||
                  item.mode.toLowerCase() === "technical")
                  ? "Technical"
                  : item.mode;
              const d = new Date(item.createdAt);
              const formattedDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
              const isDone =
                item.status?.toLowerCase() === "completed";

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/report/${item._id}`)}
                  className="card-premium flex cursor-pointer items-center justify-between gap-4 p-6 transition duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]"
                >
                  <div>
                    <h3 className="text-lg font-semibold capitalize text-[#0F172A]">
                      {item.role}
                    </h3>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {item.experience} • {displayMode}
                    </p>
                    <p className="mt-2 text-xs text-[#94A3B8]">
                      {formattedDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#2563EB]">
                        {item.final !== undefined
                          ? `${Math.round(item.final)}/10`
                          : "—/10"}
                      </p>
                      <p className="text-xs text-[#64748B]">Overall Score</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-medium ${
                        isDone
                          ? "bg-green-50 text-green-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {isDone ? "Completed" : "Incomplete"}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default InterviewHistory;
