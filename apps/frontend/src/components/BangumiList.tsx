"use client";

import type { BangumiCollection } from "@/lib/bangumi";
import { motion } from "motion/react";
import Image from "next/image";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
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

function renderStars(rate: number) {
  if (!rate)
    return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <span
          key={i}
          className={`text-xs ${i < rate ? "text-yellow-400" : "text-muted-foreground/30"}`}
        >
          ★
        </span>
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground">{rate}</span>
    </div>
  );
}

export default function BangumiList({ collections }: { collections: BangumiCollection[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
    >
      {collections.map(col => (
        <motion.a
          key={col.subject_id}
          href={`https://bgm.tv/subject/${col.subject_id}`}
          target="_blank"
          rel="noopener noreferrer"
          variants={item}
          className="group flex gap-4 p-3 rounded-lg border border-border bg-card hover:border-primary/40 transition-all"
        >
          {/* Cover */}
          <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-md bg-muted">
            {col.subject.images?.common
              ? (
                  <Image
                    src={col.subject.images.common}
                    alt={col.subject.name_cn || col.subject.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )
              : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    No Cover
                  </div>
                )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
            <div>
              <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {col.subject.name_cn || col.subject.name}
              </h3>
              {col.subject.name_cn && col.subject.name !== col.subject.name_cn && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {col.subject.name}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 mt-2">
              {renderStars(col.rate)}
              {col.comment && (
                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                  &ldquo;
                  {col.comment}
                  &rdquo;
                </p>
              )}
              <span className="text-[11px] text-muted-foreground/70">
                {formatDate(col.updated_at)}
              </span>
            </div>
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
}
