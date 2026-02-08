import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog | My Lab",
  description: "Read my latest thoughts and articles on technology, design, and more.",
};

function formatDate(date: string | null | undefined) {
  if (!date)
    return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

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
      <header className="w-full mb-16">
        <h1 className="text-4xl font-bold tracking-tight">
          Save Point
        </h1>
        <p className="mt-4 text-muted-foreground text-md">
          Ideas worth remembering, one post at a time.
        </p>
      </header>

      <ul className="w-full flex flex-col">
        {posts.map(post => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex items-baseline gap-4 py-4 "
            >
              <span className="text-base md:text-lg font-medium group-hover:text-primary transition-colors truncate">
                {post.title || "Untitled"}
              </span>
              <time className="text-sm text-muted-foreground shrink-0 tabular-nums">
                {formatDate(post.createdAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>

      {posts.length === 0 && (
        <p className="text-muted-foreground mt-8">No posts yet.</p>
      )}
    </div>
  );
}
