import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ServerUrl } from "../App";
import Step3Report from "../components/Step3Report";

function InterviewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/report/" + id,
          { withCredentials: true }
        );
        setReport(result.data);
      } catch (error) {
        console.log(error);
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
