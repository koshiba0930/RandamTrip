"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Spot } from "@/domain/entities/spot";

type Props = {
  spot: Spot;
  onRetry: () => void;
  isResult?: boolean;
};

export function ResultDisplay({ spot, onRetry, isResult = true }: Props) {
  return (
    <div className="flex flex-col items-center gap-6">
      <AnimatePresence mode="wait">
        {isResult && (
          <motion.div
            key="result-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.h2
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.5,
              }}
            >
              {spot.name}
            </motion.h2>

            <motion.p
              className="text-lg font-medium text-indigo-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {spot.prefecture}
            </motion.p>

            <motion.p
              className="max-w-md text-center leading-relaxed text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {spot.description}
            </motion.p>

            <motion.button
              onClick={onRetry}
              className="mt-4 cursor-pointer rounded-full border-2 border-indigo-600 px-8 py-3 font-semibold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              もう一度回す
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
