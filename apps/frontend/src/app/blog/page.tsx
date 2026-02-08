import type { Metadata } from "next";
import { BlogHeader } from "@/components/BlogHeader";
import BlogList from "@/components/BlogList";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog | My Lab",
  description: "Read my latest thoughts and articles on technology, design, and more.",
};

export default async function BlogPage() {
  let postsRes;
  try {
    postsRes = await api.api.v1.posts.$get({ query: { limit: "50" } });
  }
  catch (error) {
    console.error("Error fetching posts:", error);
    return <div className="py-16 text-center">Failed to fetch posts</div>;
  }

  if (!postsRes.ok) {
    console.error("Failed to fetch posts:", postsRes.statusText);
    return <div className="py-16 text-center">Failed to fetch posts</div>;
  }

  const { data: posts } = await postsRes.json();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-24 max-w-2xl mx-auto">
      <BlogHeader
        title="Save Point"
        description="Ideas worth remembering, one post at a time."
      />

      <BlogList posts={posts} />

      {posts.length === 0 && (
        <p className="text-muted-foreground mt-8">No posts yet.</p>
      )}
    </div>
  );
}
