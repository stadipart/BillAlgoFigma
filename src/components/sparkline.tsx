import { motion } from "motion/react";

interface SparklineProps {
  data: number[];
  color?: string;
  trend?: "up" | "down";
}

export function Sparkline({ data, color = "var(--accent-color)", trend = "up" }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return { x, y };
  });

  const pathData = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    return `L ${p.x} ${p.y}`;
  }).join(" ");

  const fillPathData = `${pathData} L 100 100 L 0 100 Z`;

  return (
    <svg 
      width="100%" 
      height="32" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      
      <motion.path
        d={fillPathData}
        fill={`url(#gradient-${color})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      <motion.path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    </svg>
  );
}
