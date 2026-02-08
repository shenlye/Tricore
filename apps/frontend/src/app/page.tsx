"use client";

import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const;

export default function Home() {
  return (
    <div className="mx-auto border border-border max-w-7xl w-full min-h-screen flex flex-col">
      <section className="w-full flex-1 border-b border-border items-center flex p-8 gap-4">
        <motion.div
          className="flex flex-col h-full justify-center gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="text-[10px] font-mono">01.HOME</motion.div>
          <motion.div variants={item} className="md:text-8xl text-7xl -ml-2 overflow-hidden">SHENLEY</motion.div>
          <motion.div variants={item} className="text-sm font-mono">[ Frontend Developer ]</motion.div>
          <motion.div variants={item} className="text-md border-l-3 border-primary pl-3 py-1">"慢慢来, 比较快"</motion.div>
        </motion.div>
        <div className="flex-1 h-full min-h-100">
        </div>
      </section>
    </div>
  );
}
