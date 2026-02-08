"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function BlogHeader({ title, description }: { title: string; description: string }) {
  return (
    <motion.header
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full mb-16"
    >
      <motion.h1 variants={item} className="text-4xl font-bold tracking-tight">
        {title}
      </motion.h1>
      <motion.p variants={item} className="mt-4 text-muted-foreground text-md">
        {description}
      </motion.p>
    </motion.header>
  );
}
