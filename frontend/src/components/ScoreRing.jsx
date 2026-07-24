import { useEffect, useMemo, useState } from "react";
import { scoreColor } from "../utils/analysis";

const ScoreRing = ({
  score = 0,
  size = 56,
  strokeWidth = 4,
  label,
  animated = true,
}) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!animated) {
      return undefined;
    }

    let current = 0;
    const step = Math.max(1, Math.ceil(safeScore / 40));
    const interval = window.setInterval(() => {
      current = Math.min(safeScore, current + step);
      setAnimatedProgress(current);

      if (current >= safeScore) {
        window.clearInterval(interval);
      }
    }, 15);

    return () => window.clearInterval(interval);
  }, [animated, safeScore]);

  const progress = animated ? animatedProgress : safeScore;

  const metrics = useMemo(() => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return { radius, circumference, offset };
  }, [progress, size, strokeWidth]);

  const color = scoreColor(safeScore);
  const fontSize = Math.max(12, Math.round(size * 0.24));

  return (
    <div className="flex flex-col items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={metrics.radius}
          stroke="#e8edf4"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={metrics.radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={metrics.circumference}
          strokeDashoffset={metrics.offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#111827"
          fontSize={fontSize}
          fontWeight="700"
        >
          {progress}
        </text>
      </svg>

      {label && (
        <span className="mt-2 text-[11px] font-medium text-gray-500">
          {label}
        </span>
      )}
    </div>
  );
};

export default ScoreRing;
