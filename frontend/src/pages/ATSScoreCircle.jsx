import { useEffect, useState } from "react";

const ATSScoreCircle = ({ score = 55 }) => {
  const [progress, setProgress] = useState(0);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let start = 0;

    const interval = setInterval(() => {
      start += 1;
      if (start >= score) {
        start = score;
        clearInterval(interval);
      }
      setProgress(start);
    }, 15); // speed

    return () => clearInterval(interval);
  }, [score]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">

      <svg width="120" height="120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />

        {/* Gradient */}
        <defs>
          <linearGradient id="gradient">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Score text */}
      <div className="absolute text-xl font-bold text-gray-800">
        {progress}
      </div>

      <p className="text-sm text-gray-500 mt-2">ATS Score</p>
    </div>
  );
};

export default ATSScoreCircle;