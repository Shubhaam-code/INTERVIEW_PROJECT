import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function Timmer({ timeLeft, totalTime }) {
  const percentage = (timeLeft / totalTime) * 100;
  return (
    <div className="h-24 w-24">
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textColor: "#0F172A",
          pathColor: "#2563EB",
          trailColor: "#E5E7EB",
          textSize: "22px",
          strokeLinecap: "round",
          pathTransitionDuration: 1,
        })}
      />
    </div>
  );
}

export default Timmer;
