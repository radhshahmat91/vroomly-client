"use client";

import { motion } from "motion/react";

/** Animated "404" with a car that drives along the lane markings and stops at the end of the road. */
export function NotFoundRoad() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <p className="font-display text-[9rem] font-extrabold leading-none tracking-tight sm:text-[12rem]" aria-hidden="true">
        4<span className="text-primary">0</span>4
      </p>
      <div className="relative mt-2 h-10 overflow-hidden">
        <div className="road-dashes absolute inset-x-0 top-1/2 text-base-300" />
        <motion.svg
          viewBox="0 0 120 48"
          className="absolute top-0 h-10 w-24"
          initial={{ x: "-110%" }}
          animate={{ x: "170%" }}
          transition={{ duration: 3.2, ease: [0.22, 1, 0.36, 1], repeat: Infinity, repeatDelay: 1.2 }}
          aria-hidden="true"
        >
          <path d="M6 34c0-8 4-13 11-15l14-5c5-6 11-10 20-10h22c8 1 14 5 20 12l12 3c7 2 11 6 11 13v4H6z" fill="#ffc21a" />
          <path d="M40 18l9-9c3-3 6-4 10-4h17c4 0 7 2 10 5l7 8z" fill="#1b1f24" opacity=".85" />
          <circle cx="36" cy="38" r="8" fill="#1b1f24" />
          <circle cx="92" cy="38" r="8" fill="#1b1f24" />
          <circle cx="36" cy="38" r="3" fill="#ffc21a" />
          <circle cx="92" cy="38" r="3" fill="#ffc21a" />
        </motion.svg>
      </div>
    </div>
  );
}
