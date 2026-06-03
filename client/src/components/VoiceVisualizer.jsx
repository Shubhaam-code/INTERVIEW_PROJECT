import React from "react";
import { motion } from "framer-motion";

function VoiceVisualizer({ active = false }) {
  const bars = 12;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <motion.div
        animate={active ? { scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl"
      />
      <motion.div
        animate={active ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-4 rounded-full border-2 border-blue-200"
      />
      <div className="relative flex h-24 w-24 items-center justify-center gap-1 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/40">
        {Array.from({ length: bars }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-white/90"
            animate={
              active
                ? { height: [8, 20 + (i % 3) * 8, 8] }
                : { height: 8 }
            }
            transition={{
              duration: 0.5 + (i % 4) * 0.1,
              repeat: Infinity,
              delay: i * 0.05,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default VoiceVisualizer;
