import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { motion } from 'motion/react';
import 'react-circular-progressbar/dist/styles.css';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';
import { jsPDF } from 'jspdf';

function Step3Report({ report }) {
    if (!report) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-gray-500 text-lg'>
                    Loading Report...
                </p>
            </div>
        )
    }

    const {
        finalScore = 0,
        confidence = 0,
        communication = 0,
        correctness = 0,
        questionWiseScore = []
    } = report;

    const questionScoreData = questionWiseScore.map((score, index) => ({
        name: `Q${index + 1}`,
        score: score.score || 0
    }));

    const skills = [
        { label: "Confidence", value: confidence },
        { label: "Communication", value: communication },
        { label: "Correctness", value: correctness },
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

    const navigate = useNavigate();
    const score = finalScore;
    const percentage = (score / 10) * 100;

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const margin = 20;
        let y = 20;

        const primaryColor = [16, 185, 129]; // Emerald RGB
        const darkTextColor = [31, 41, 55]; // Gray-800 RGB
        const lightTextColor = [107, 114, 128]; // Gray-500 RGB

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(...darkTextColor);
        doc.text("Interview Analytics Report", margin, y);
        y += 10;

        // Date
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...lightTextColor);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, y);
        y += 10;

        // Divider
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.line(margin, y, 210 - margin, y);
        y += 15;

        // Overall Performance Section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...darkTextColor);
        doc.text("Overall Performance", margin, y);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(...darkTextColor);
        doc.text(`Overall Score: ${score}/10`, margin, y);
        y += 6;
        doc.text(`Evaluation: ${performanceText}`, margin, y);
        y += 6;
        doc.text(`Feedback Tagline: ${shortTagline}`, margin, y);
        y += 15;

        // Skill Evaluation
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...darkTextColor);
        doc.text("Skill Evaluation", margin, y);
        y += 8;

        skills.forEach(skill => {
            doc.setFont("helvetica", "normal");
            doc.text(`${skill.label}: ${skill.value}/10`, margin, y);
            y += 6;
        });
        y += 15;

        // Question Breakdown Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...darkTextColor);
        doc.text("Question Breakdown & Feedback", margin, y);
        y += 10;

        // Question details loop
        questionWiseScore.forEach((q, index) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(...darkTextColor);

            const questionLines = doc.splitTextToSize(`Q${index + 1}: ${q.question || "N/A"}`, 210 - margin * 2);
            doc.text(questionLines, margin, y);
            y += questionLines.length * 6;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...primaryColor);
            doc.text(`Score: ${q.score ?? 0}/10`, margin, y);
            y += 6;

            doc.setTextColor(...lightTextColor);
            const feedbackLines = doc.splitTextToSize(`AI Feedback: ${q.feedback || "No feedback available."}`, 210 - margin * 2 - 5);
            doc.text(feedbackLines, margin + 5, y);
            y += feedbackLines.length * 5 + 10;
        });

        // Save PDF
        doc.save(`Interview_Report_${report._id || 'session'}.pdf`);
    };

    return (
        <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8'>
            {/* Header Area */}
            <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div className='flex items-start gap-4 flex-wrap'>
                    <button
                        onClick={() => navigate("/history")}
                        className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
                        <FaArrowLeft className='text-gray-600' />
                    </button>
                    <div>
                        <h1 className='text-3xl font-bold flex-nowrap text-gray-600'>Interview Analytics Dashboard</h1>
                        <p className='text-gray-600 mt-2'>
                            AI-powered performance insights
                        </p> 
                    </div>
                </div>
                <button 
                    onClick={handleDownloadPDF}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base whitespace-nowrap'
                >
                    Download PDF
                </button>
            </div>

            {/* Layout Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
                {/* Column 1: Sidebar with overall score and skill evaluation */}
                <div className='space-y-6'>
                    {/* Overall Score */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center"
                    >
                        <h3 className='text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base'>
                            Overall Performance
                        </h3>
                        <div className='relative w-36 h-36 sm:w-44 sm:h-44 mx-auto'>
                            <CircularProgressbar
                                value={percentage}
                                text={`${score}/10`}
                                styles={buildStyles({
                                    textColor: "#ef4444",
                                    pathColor: "#10b981",
                                    trailColor: "#e5e7eb",
                                    textSize: "18px"
                                })}
                            />
                        </div>
                        <p className='text-gray-400 mt-3 text-xs sm:text-sm'>
                            Out of 10
                        </p>
                        <div className='mt-6 sm:mt-8'>
                            <h4 className='text-lg sm:text-xl font-bold text-gray-800'>{performanceText}</h4>
                            <p className='text-gray-500 mt-2 text-sm'>{shortTagline}</p>
                        </div>
                    </motion.div>

                    {/* Skill Evaluation */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8"
                    >
                        <h3 className='text-base sm:text-lg font-semibold text-gray-700 mb-6 text-center'>
                            Skill Evaluation
                        </h3>
                        <div className='space-y-5'>
                            {skills.map((s, i) => (
                                <div key={i}>
                                    <div className='flex justify-between mb-2 text-sm sm:text-base'>
                                        <span className='text-gray-600 font-medium'>{s.label}</span>
                                        <span className='font-semibold text-emerald-600'>
                                            {s.value}/10
                                        </span>
                                    </div>
                                    <div className='bg-gray-100 h-2 sm:h-3 rounded-full overflow-hidden'>
                                        <div 
                                            className='bg-emerald-500 h-full rounded-full transition-all duration-500'
                                            style={{ width: `${s.value * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Column 2 & 3: Main dashboard content */}
                <div className='lg:col-span-2 space-y-6'>
                    {/* Performance Trend Chart */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8"
                    >
                        <h3 className='text-base sm:text-lg font-semibold text-gray-700 mb-6'>
                            Performance Trend
                        </h3>
                        <div className='h-64 sm:h-80 w-full'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <AreaChart data={questionScoreData}>
                                    <defs>
                                        <linearGradient id='scoreGrad' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='#10b981' stopOpacity={0.3}/>
                                            <stop offset='95%' stopColor='#10b981' stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' />
                                    <XAxis dataKey='name' stroke='#9ca3af' tickLine={false} />
                                    <YAxis stroke='#9ca3af' domain={[0, 10]} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '0.75rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }} 
                                    />
                                    <Area 
                                        type='monotone' 
                                        dataKey='score' 
                                        stroke='#10b981' 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill='url(#scoreGrad)' 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Question Breakdown */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8'
                    >
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-6">
                            Question Breakdown
                        </h3>
                        <div className='space-y-6'>
                            {questionWiseScore.map((q, i) => (
                                <div key={i} className='bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200'>
                                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Question {i + 1}
                                            </p>
                                            <p className="font-semibold text-gray-800 text-sm sm:text-base leading-relaxed mt-1">
                                                {q.question || "Question not available"}
                                            </p>
                                        </div>
                                        <div className='bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit whitespace-nowrap'>
                                            {q.score ?? 0}/10
                                        </div>
                                    </div>

                                    <div className='bg-green-50 border border-green-200 p-4 rounded-lg'>
                                        <p className='text-xs text-green-600 font-semibold mb-1'>
                                            AI Feedback
                                        </p>
                                        <p className='text-sm text-gray-700 leading-relaxed'>
                                            {q.feedback && q.feedback.trim() !== ""
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
    )
}

export default Step3Report
