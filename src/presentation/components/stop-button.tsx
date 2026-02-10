"use client";

import { motion } from "framer-motion";

type Props = {
  onClick: () => void;
};

export function StopButton({ onClick }: Props) {
  return (
    <motion.button
      onClick={onClick}
      className="cursor-pointer rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-12 py-5 text-xl font-bold text-white shadow-lg transition-shadow hover:shadow-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      止める
    </motion.button>
  );
}
