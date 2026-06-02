import React from 'react'
import {
   CircularProgressbar,
   buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
function Timmer({timeLeft,totalTime}) {
    const percentage = (timeLeft/totalTime)*100
  return (
    <div className='w-20 h-20'>
      <CircularProgressbar
            value={percentage}
            text={`${timeLeft}s`}
            styles={buildStyles({

            textColor: "#ef4444",

            pathColor: "#10b981",

            trailColor: "#e5e7eb",

            textSize: "28px",
 
            strokeLinecap: "round",

            pathTransitionDuration: 1.5,
        })}
         />

    </div>
  )
}

export default Timmer
