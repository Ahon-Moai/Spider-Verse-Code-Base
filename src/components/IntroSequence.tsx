import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import heroF1Img from '../assets/images/hero_f1_diecast_studio_1794664768996.jpg';
import pro118Img from '../assets/images/campaign_f1_pro_118_1794664772367.jpg';
import display143Img from '../assets/images/campaign_f1_display_143_1794664770809.jpg';

interface IntroSequenceProps {
  onComplete: () => void;
  /** Whether this is a subsequent page transition (snappier) or initial site entry */
  isPageTransition?: boolean;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({
  onComplete,
  isPageTransition = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    setCounter(0);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCounter(100);
      const timer = setTimeout(() => setIsVisible(false), 350);
      return () => clearTimeout(timer);
    }

    const duration = isPageTransition ? 850 : 1450;
    const steps = 100;
    const intervalTime = duration / steps;

    let exitTimeout: ReturnType<typeof setTimeout> | null = null;

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          exitTimeout = setTimeout(() => {
            setIsVisible(false);
          }, 120);
          return 100;
        }
        return prev + 2 > 100 ? 100 : prev + 2;
      });
    }, intervalTime * 2);

    return () => {
      clearInterval(interval);
      if (exitTimeout) clearTimeout(exitTimeout);
    };
  }, [isPageTransition]);

  const handleSkip = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#08090B] text-[#F4F2EE] flex flex-col justify-between overflow-hidden select-none cursor-pointer apex-grid-dark"
          initial={{ opacity: 1, y: '0%' }}
          animate={{ opacity: 1, y: '0%' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          onClick={handleSkip}
          aria-label="Intro sequence. Click anywhere to enter."
        >
          {/* Top Motorsport Telemetry Header */}
          <div className="w-full px-6 sm:px-10 pt-6 flex items-center justify-between border-b border-white/10 pb-4">
            <span className="font-logo marvel-logo-badge text-lg sm:text-xl uppercase">
              SPIDER-VERSE
            </span>
            <span className="font-mono text-[11px] tracking-[0.24em] uppercase text-[#9CA3AF]">
              TAP TO ENTER
            </span>
          </div>

          {/* Center Composition: Layered F1 Diecast Studio Frames */}
          <div className="relative flex-1 flex items-center justify-center px-6">
            <div className="relative w-full max-w-4xl flex items-center justify-center">
              {/* Left Angled 1:18 Frame */}
              <motion.div
                className="hidden sm:block absolute w-48 md:w-64 aspect-[16/10] border border-white/15 bg-[#111317] overflow-hidden shadow-2xl"
                initial={{ opacity: 0, x: -40, rotate: -6 }}
                animate={{ opacity: 0.72, x: -165, y: 18, rotate: -7 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src={pro118Img}
                  alt="1:18 Scale Carbon Formula 1 Diecast Model"
                  className="w-full h-full object-cover brightness-75 contrast-125"
                />
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#E10600]" />
              </motion.div>

              {/* Right Angled 1:43 Frame */}
              <motion.div
                className="hidden sm:block absolute w-48 md:w-64 aspect-[16/10] border border-white/15 bg-[#111317] overflow-hidden shadow-2xl"
                initial={{ opacity: 0, x: 40, rotate: 6 }}
                animate={{ opacity: 0.72, x: 165, y: -18, rotate: 7 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
              >
                <img
                  src={display143Img}
                  alt="1:43 Collector Edition F1 Display Cars"
                  className="w-full h-full object-cover brightness-75 contrast-125"
                />
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#E10600]" />
              </motion.div>

              {/* Center Hero Plate */}
              <motion.div
                className="relative w-64 sm:w-80 md:w-96 aspect-[16/10] border border-white/25 bg-[#111317] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.85)] z-10"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src={heroF1Img}
                  alt="Spider-Verse 1:18 Signature Formula 1 Toy Car"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-[#E10600]" />
              </motion.div>

              {/* Oversized Display Lockup */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
              >
                <span className="font-mono text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#E10600] font-semibold mb-1.5 bg-[#08090B]/80 px-2.5 py-0.5 border border-white/10">
                  F1 DIECAST & RC
                </span>
                <h1 className="font-logo bg-[#EC1D24] text-white px-5 sm:px-8 py-2 sm:py-3 uppercase tracking-[-0.02em] text-5xl sm:text-7xl md:text-8xl leading-[0.86] drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)]">
                  SPIDER-VERSE
                </h1>
              </motion.div>
            </div>
          </div>

          {/* Bottom Pit-Wall Progress Bar & Lap Counter */}
          <div className="w-full px-6 sm:px-10 pb-6 pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em]">
              <span className="text-[#9CA3AF]">FORMULA 1 TOY CARS & SCALE MODELS</span>
              <span className="text-white font-semibold tabular-nums">
                {String(counter).padStart(3, '0')}%
              </span>
            </div>
            <div className="w-full h-[2px] bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[#E10600] origin-left transition-transform duration-100 ease-out"
                style={{ transform: `scaleX(${counter / 100})` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
