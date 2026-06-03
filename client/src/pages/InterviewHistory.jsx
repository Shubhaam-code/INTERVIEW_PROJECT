import React, { useEffect, useState } from 'react';
import { ServerUrl } from '../App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function InterviewHistory() {
    const [interviews,setInterviews] = useState([])

    const navigate = useNavigate();

    useEffect(()=>{
        const getMyInterviews = async()=>{
            try{
                const result = await axios.get(ServerUrl + '/api/interview/get-interview', {
                    withCredentials : true
                })
                setInterviews(result.data.interview || [])
            }catch(error){
                console.log(error)
            }
        }
        getMyInterviews()
    },[])
  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-emerald-50 py-10'>
        <div className='w-[90vw] lg:w-[70vw] max-w-[90%] mx-auto'>
            <div className='mb-10 w-full flex items-start gap-4 flexwrap'>
                <button
                onClick={()=>navigate("/")}
                className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'>
                    <FaArrowLeft className='text-gray-600'/>
                </button>
                <div>
                    <h1 className='text-3xl fond-bold flex-nowrap text-gray-600'>Interview History</h1>
                    <p className='text-gray-600 mt-2'>
                        Track your past interviews and performance
                    </p>
                </div>
            </div>

            {interviews.length === 0 ? (
                <div className='bg-white p-10 rounded-2xl shadow text-center'>
                    <p className='text-gray-500'>
                        No interviews found. Start your first interview.
                    </p>
                </div>
            ) : (
                <div className='grid gap-6'>
                    {interviews.map((item,index)=>{
                        const displayMode = item.mode && (item.mode.toLowerCase() === 'techinal' || item.mode.toLowerCase() === 'technical') ? 'Technical' : item.mode;
                        const formattedDate = () => {
                            const d = new Date(item.createdAt);
                            const day = String(d.getDate()).padStart(2, '0');
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            const year = d.getFullYear();
                            return `${day}/${month}/${year}`;
                        };
                        return (
                            <div key={index} 
                            onClick={()=>navigate(`/report/${item._id}`)}
                            className='bg-white p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 flex justify-between items-center'>
                                <div>
                                    <h3 className='text-lg font-semibold text-gray-800 capitalize'>
                                        {item.role}
                                    </h3>
                                    <p className='text-gray-500 text-sm mt-1'>
                                        {item.experience} • {displayMode}
                                    </p>
                                    <p className='text-xs text-gray-400 mt-2'>
                                        {formattedDate()}
                                    </p>
                                </div>
                                <div className='flex items-center gap-6'>
                                    {/* Score */}
                                    <div className='text-right'>
                                        <p className='text-xl font-bold text-emerald-600'>
                                            {item.final !== undefined ? Math.round(item.final) : 0}/10
                                        </p>
                                        <p className='text-xs text-gray-400'>
                                            Overall Score
                                        </p>
                                    </div>
                                    {/* STATUS BADGE */}
                                    <span
                                    className={`px-4 py-1 rounded-full text-xs font-medium 
                                        ${item.status && item.status.toLowerCase() === "completed"
                                            ? "bg-emerald-100 text-emerald-700" 
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                                        {item.status && item.status.toLowerCase() === "completed" ? "completed" : "incompleted"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
}

export default InterviewHistory;
