import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 2 }: AnimatedCounterProps) {
  // Extract number from string like "$45,231" or "2,845"
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
  const prefix = value.match(/^[^0-9]*/)?.[0] || "";
  const suffix = value.match(/[^0-9.]+$/)?.[0] || "";
  
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  useEffect(() => {
    motionValue.set(numericValue);
  }, [numericValue, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [springValue]);

  const formatNumber = (num: number) => {
    if (value.includes(",")) {
      return Math.round(num).toLocaleString();
    }
    if (value.includes(".")) {
      return num.toFixed(1);
    }
    return Math.round(num).toString();
  };

  return (
    <span>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}
