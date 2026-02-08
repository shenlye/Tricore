"use client";

import type { Variants } from "motion/react";
import { motion } from "motion/react";
import Link from "next/link";

interface Post {
  id: number;
  title: string | null;
  slug: string | null;
  createdAt: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function formatDate(date: string | null | undefined) {
  if (!date)
    return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function BlogList({ posts }: { posts: Post[] }) {
  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col"
    >
      {posts.map(post => (
        <motion.li key={post.id} variants={item}>
          <Link
            href={`/blog/${post.slug}`}
            className="group flex items-baseline gap-4 py-4 transition-colors"
          >
            <span className="text-base font-medium group-hover:text-primary transition-colors truncate">
              {post.title || "Untitled"}
            </span>
            <time className="text-sm text-muted-foreground shrink-0 tabular-nums font-mono">
              {formatDate(post.createdAt)}
            </time>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
