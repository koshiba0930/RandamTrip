"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Spot } from "@/domain/entities/spot";

type Props = {
  currentSpot: Spot;
};

export function RouletteAnimation({ currentSpot }: Props) {
  return (
    <div className="flex h-24 items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSpot.id}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl"
        >
          {currentSpot.name}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
