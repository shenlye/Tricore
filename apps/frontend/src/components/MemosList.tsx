"use client";

import { motion } from "motion/react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

interface MemoItem {
  id: number;
  content: string;
  createdAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function MemosList({ memos }: { memos: MemoItem[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full"
    >
      {memos.map(memo => (
        <motion.div
          key={memo.id}
          variants={item}
          className="rounded-lg bg-card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/avatar.png"
              alt="Shenley"
              width={40}
              height={40}
              unoptimized
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Shenley</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(memo.createdAt)}
                {" · "}
                {formatTime(memo.createdAt)}
              </span>
            </div>
          </div>

          {/* Markdown content */}
          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-foreground">
            <ReactMarkdown>
              {memo.content}
            </ReactMarkdown>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
