import React, { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Step3Report from "../components/Step3Report";

function InterviewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // axiosClient sends Authorization: Bearer header for mobile
        const result = await axiosClient.get(`/api/interview/report/${id}`);
        setReport(result.data);
      } catch (error) {
        console.error("[InterviewReport] Fetch error:", error?.response?.status);
      }
    };
    fetchReport();
  }, [id]);

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F9FF]">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg text-[#64748B]"
        >
          Loading report...
        </motion.p>
      </div>
    );
  }

  return <Step3Report report={report} />;
}

export default InterviewReport;
