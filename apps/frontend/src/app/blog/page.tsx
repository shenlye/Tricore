import type { Metadata } from "next";
import BlogContent from "@/components/BlogContent";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog | My Lab",
  description: "Read my latest thoughts and articles on technology, design, and more.",
};

export default async function BlogPage() {
  const postsRes = await api.api.v1.posts.$get({ query: { limit: "11" } });

  if (!postsRes.ok) {
    return <div className="py-16 text-center">Failed to fetch posts</div>;
  }

  const { data: posts } = await postsRes.json();

  return <BlogContent initialPosts={posts} />;
}
