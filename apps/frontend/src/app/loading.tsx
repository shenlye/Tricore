"use client";
import { motion } from "motion/react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex bg-black overflow-hidden">
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="w-1 bg-primary"
      />

      <div className="flex flex-col items-center justify-center w-full">
        <h1 className="text-foreground text-2xl font-bold tracking-widest animate-pulse">
          LOADING...
        </h1>
      </div>
    </div>
  );
}
