import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function Step3Report({report}) {
    if(!report){
        return (
            <div
            className='min-h-screen flex items-center justify-center'
            >
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

    const questionScoreData = questionWiseScore.map((score,index)=>({
        name:`Q${index+1}`,
        score:score.score || 0
    }))

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
    const navigate=useNavigate()
  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8'>
        <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                        <div className='mb-10 w-full flex items-start gap-4 flexwrap'>
                            <button
                            onClick={()=>navigate("/history")}
                            className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
                                <FaArrowLeft className='text-gray-600'/>
                            </button>
                            <div>
                                <h1 className='text-3xl fond-bold flex-nowrap text-gray-600'>Interview Analytics Dashboard</h1>
                                <p className='text-gray-600 mt-2'>
                                    Track your past interviews and performance
                                </p>
                            </div>
                        </div>
        </div>
    </div>
  )
}

export default Step3Report
