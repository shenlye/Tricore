import type { Metadata } from "next";
import * as motion from "motion/react-client";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog | My Lab",
  description: "Read my latest thoughts and articles on technology, design, and more.",
};

export default async function BlogPage() {
  const res = await api.api.v1.posts.$get({
    query: {
      limit: "10",
    },
  });

  if (!res.ok) {
    return <div className="py-16 text-center">Failed to fetch posts</div>;
  }

  const { data: posts } = await res.json();

  return (
    <div className="flex flex-col justify-center items-center gap-8 py-16 px-2 perspective-[2500px]">
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
          className="w-full max-w-2xl"
        >
          <PostCard
            title={post.title || "Untitled"}
            description={post.description || ""}
            category={post.categories?.[0] || "General"}
            date={new Date(post.createdAt).toLocaleDateString("zh-CN")}
            slug={post.slug || post.id.toString()}
            image={post.cover || undefined}
          />
        </motion.div>
      ))}
    </div>
  );
}
