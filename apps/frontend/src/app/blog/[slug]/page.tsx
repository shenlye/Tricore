import type { Metadata } from "next";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const res = await api.api.v1.posts[":idOrSlug"].$get({
    param: { idOrSlug: slug },
  });

  if (!res.ok)
    return { title: "Post Not Found" };

  const result = await res.json();
  const post = "data" in result ? result.data : result;

  const displayTitle = post.title || post.slug || "Untitled Post";

  return {
    title: displayTitle,
    description: post.description || post.content?.slice(0, 160),
    openGraph: {
      title: displayTitle,
      description: post.description || post.content?.slice(0, 160),
      type: "article",
      publishedTime: post.createdAt,
      images: post.cover ? [post.cover] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: displayTitle,
      description: post.description || post.content?.slice(0, 160),
      images: post.cover ? [post.cover] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const res = await api.api.v1.posts[":idOrSlug"].$get({
    param: {
      idOrSlug: slug,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    return (
      <div className="py-16 text-center container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Error loading post</h1>
        <p>Could not fetch the blog post. Please try again later.</p>
        <Link href="/blog" className="text-primary hover:underline mt-4 inline-block">Back to Blog</Link>
      </div>
    );
  }

  const result = await res.json();
  const post = "data" in result ? result.data : result;
  const displayTitle = post.title || post.slug || "Untitled Post";

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <Icon icon="lucide:arrow-left" className="mr-2" />
          Back to Blog
        </Link>

        <header className="mb-12">
          {post.categories && post.categories.length > 0 && (
            <div className="flex gap-2 mb-4">
              {post.categories.map((cat: string) => (
                <span key={cat} className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded-xs">
                  {cat}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-balance">
            {displayTitle}
          </h1>

          <div className="flex items-center text-muted-foreground text-sm">
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none prose-lg">
          {post.content
            ? (
                <ReactMarkdown>{post.content}</ReactMarkdown>
              )
            : (
                <p className="text-muted-foreground">No content available.</p>
              )}
        </div>
      </article>
    </div>
  );
}
