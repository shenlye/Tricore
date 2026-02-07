"use client";

import type { InferResponseType } from "hono/client";
import type { PostCardVariant } from "@/components/PostCard";
import { Icon } from "@iconify/react";
import * as motion from "motion/react-client";
import { useState } from "react";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";

type PostsResponse = InferResponseType<typeof api.api.v1.posts.$get, 200>;
type Post = PostsResponse["data"][number];

interface CardLayout {
  containerClass: string;
  variant: PostCardVariant;
  reversed: boolean;
}

const LAYOUT_PATTERN: CardLayout[] = [
  { containerClass: "w-full max-w-4xl ml-auto", variant: "default", reversed: false },
  { containerClass: "w-full max-w-3xl ml-auto", variant: "cyber", reversed: true },
  { containerClass: "w-full max-w-3xl ml-auto", variant: "sunset", reversed: false },
  { containerClass: "w-full max-w-2xl ml-auto", variant: "mono", reversed: true },
  { containerClass: "w-full max-w-3xl ml-auto", variant: "default", reversed: false },
];

const MOBILE_VARIANTS: PostCardVariant[] = ["default", "cyber", "sunset", "mono"];

function getLayout(index: number): CardLayout {
  return LAYOUT_PATTERN[index % LAYOUT_PATTERN.length];
}

export default function BlogContent({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const loadPage = async (newPage: number) => {
    setIsLoading(true);
    try {
      const postsRes = await api.api.v1.posts.$get({
        query: { limit: ITEMS_PER_PAGE.toString(), page: newPage.toString() },
      });

      if (postsRes.ok) {
        const { data } = await postsRes.json();
        setPosts(data);
      }

      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-16 max-w-6xl ml-auto">
      <div className="hidden md:flex md:flex-col gap-8">
        {posts.map((post, index) => {
          const layout = getLayout(index);
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0, 1, 0.3, 1],
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                times: [0, 0.1, 0.2, 0.35, 0.6, 1],
                ease: "linear",
              }}
              className={layout.containerClass}
            >
              <PostCard
                title={post.title || "Untitled"}
                description={post.description || ""}
                category={post.categories?.[0] || "General"}
                date={new Date(post.createdAt).toLocaleDateString("zh-CN")}
                slug={post.slug || post.id.toString()}
                image={post.cover || undefined}
                variant={layout.variant}
                reversed={layout.reversed}
              />
            </motion.div>
          );
        })}
      </div>

      {/* 移动端：单列布局，保留色彩变化 */}
      <div className="md:hidden flex flex-col gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0.3, 1] }}
            transition={{
              duration: 0.4,
              delay: index * 0.2,
              times: [0, 0.1, 0.2, 0.35, 0.6, 1],
              ease: "linear",
            }}
          >
            <PostCard
              title={post.title || "Untitled"}
              description={post.description || ""}
              category={post.categories?.[0] || "General"}
              date={new Date(post.createdAt).toLocaleDateString("zh-CN")}
              slug={post.slug || post.id.toString()}
              image={post.cover || undefined}
              variant={MOBILE_VARIANTS[index % MOBILE_VARIANTS.length]}
            />
          </motion.div>
        ))}
      </div>

      {/* 分页按钮 */}
      <div className="flex justify-center gap-2 mt-8 mb-16">
        <button
          onClick={() => loadPage(page - 1)}
          disabled={page === 1 || isLoading}
          className="px-4 py-2 bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Icon icon="lucide:chevron-left" className="text-lg" />
          <span className="text-sm">上一页</span>
        </button>

        <div className="px-4 py-2 bg-muted flex items-center">
          <span className="text-sm text-muted-foreground">
            第
            {page}
            {" "}
            页
          </span>
        </div>

        <button
          onClick={() => loadPage(page + 1)}
          disabled={posts.length < ITEMS_PER_PAGE || isLoading}
          className="px-4 py-2 bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span className="text-sm">下一页</span>
          <Icon icon="lucide:chevron-right" className="text-lg" />
        </button>
      </div>
    </div>
  );
}
