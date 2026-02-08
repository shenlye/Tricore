"use client";

import { motion } from "motion/react";
import Image from "next/image";

interface LinkItem {
  id: number;
  title: string;
  link: string;
  avatar?: string | null;
  desc?: string | null;
}

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

export default function LinksList({ links }: { links: LinkItem[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full"
    >
      {links.map(link => (
        <motion.a
          key={link.id}
          href={link.link}
          target="_blank"
          rel="noopener noreferrer"
          variants={item}
          className="group flex items-center gap-4 p-4 hover:border-primary/50 bg-card transition-all rounded-sm"
        >
          <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-full bg-muted">
            {link.avatar
              ? (
                  <Image
                    src={link.avatar}
                    alt={link.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                )
              : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground whitespace-nowrap">
                    {link.title.charAt(0)}
                  </div>
                )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
              {link.title}
            </h3>
            {link.desc && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {link.desc}
              </p>
            )}
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
}
