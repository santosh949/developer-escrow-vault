"use client";

import { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

// Magnetic Button Physics Hook
export function useMagnetic(intensity: number = 0.2) {
  const ref = useRef<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * intensity, y: middleY * intensity });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return { ref, position, handleMouseMove, handleMouseLeave };
}

// Kinetic Typography Timer
export function KineticTimer({ days }: { days: number }) {
  const controls = useAnimation();
  const digits = days.toString().split('');

  useEffect(() => {
    controls.start({
      y: [20, 0],
      opacity: [0, 1],
      transition: { type: 'spring', stiffness: 200, damping: 15, mass: 0.5, staggerChildren: 0.1 }
    });
  }, [days, controls]);

  return (
    <div className="flex items-center space-x-1 overflow-hidden h-8">
      {digits.map((digit, i) => (
        <motion.span
          key={`${i}-${digit}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: i * 0.1 }}
          className="text-2xl font-bold text-green-500 font-mono inline-block"
        >
          {digit}
        </motion.span>
      ))}
      <span className="text-neutral-500 text-sm ml-2">DAYS</span>
    </div>
  );
}
