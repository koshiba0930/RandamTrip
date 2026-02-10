"use client";

import { motion } from "framer-motion";
import { Spot } from "@/domain/entities/spot";

type Props = {
  spot: Spot;
  onRetry: () => void;
};

export function ResultDisplay({ spot, onRetry }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-6"
    >
      <motion.h2
        className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {spot.name}
      </motion.h2>

      <p className="text-lg font-medium text-indigo-600">{spot.prefecture}</p>

      <p className="max-w-md text-center leading-relaxed text-gray-600">
        {spot.description}
      </p>

      <motion.button
        onClick={onRetry}
        className="mt-4 cursor-pointer rounded-full border-2 border-indigo-600 px-8 py-3 font-semibold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        もう一度回す
      </motion.button>
    </motion.div>
  );
}
