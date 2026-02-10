"use client";

import { motion } from "framer-motion";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function RouletteButton({ onClick, disabled }: Props) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="relative cursor-pointer rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-5 text-xl font-bold text-white shadow-lg transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      運命を決める
    </motion.button>
  );
}
