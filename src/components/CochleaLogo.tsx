"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function CochleaLogo({ className = "w-8 h-8" }: { className?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative flex items-center justify-center cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="¡Cóclea enrollada vs. desenrollada!"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="cochlea-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Estado 1: Cóclea Enrollada (Caracol) */}
        <motion.path
          d="M 12 48 C 12 22, 32 12, 54 12 C 78 12, 88 30, 88 52 C 88 74, 72 88, 50 88 C 32 88, 22 74, 22 56 C 22 40, 34 28, 50 28 C 64 28, 74 38, 74 52 C 74 64, 64 72, 52 72 C 42 72, 36 64, 38 52 C 40 44, 48 40, 54 44"
          stroke="url(#cochlea-gradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            opacity: isHovered ? 0 : 1,
            scale: isHovered ? 0.8 : 1,
            rotate: isHovered ? -45 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        />

        {/* Estado 2: Cóclea Desenrollada (Tubo coclear y membrana basilar, inspirado en la teoría clásica del oído interno) */}
        <motion.g
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8,
            y: isHovered ? 0 : 5,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ transformOrigin: "center" }}
        >
          {/* Contorno superior del conducto */}
          <path
            d="M 10 45 C 30 35, 70 35, 90 42 C 93 43, 93 47, 90 48 C 70 41, 30 41, 10 51 Z"
            fill="url(#cochlea-gradient)"
          />
          {/* Contorno inferior del conducto */}
          <path
            d="M 10 53 C 30 63, 70 63, 90 52 C 93 51, 93 47, 90 48 C 70 59, 30 59, 10 53 Z"
            fill="url(#cochlea-gradient)"
            opacity="0.7"
          />
          {/* Membrana Basilar interna (línea divisoria de rampas) */}
          <line
            x1="18"
            y1="49"
            x2="88"
            y2="49"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Ápice / Helicotrema en el extremo */}
          <circle cx="90" cy="48" r="4" fill="#a855f7" />
        </motion.g>
      </svg>
    </div>
  );
}