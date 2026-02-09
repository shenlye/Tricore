import type { Metadata } from "next";
import MemosList from "@/components/MemosList";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Memos | Shenley",
  description: "Short thoughts and quick notes.",
};

export default async function MemosPage() {
  let memosRes;
  try {
    memosRes = await api.api.v1.memos.$get({ query: { limit: "50" } });
  }
  catch (error) {
    console.error("Error fetching memos:", error);
    return <div className="py-16 text-center">Failed to fetch memos</div>;
  }

  if (!memosRes.ok) {
    console.error("Failed to fetch memos:", memosRes.statusText);
    return <div className="py-16 text-center">Failed to fetch memos</div>;
  }

  const { data: memos } = await memosRes.json();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-24 max-w-2xl mx-auto">
      <header className="w-full mb-12 px-4 md:px-0">
        <h1 className="text-4xl font-bold tracking-tight">
          Memos
        </h1>
        <p className="mt-4 text-muted-foreground text-md">
          Fleeting thoughts, captured in time.
        </p>
      </header>

      <div className="w-full px-4 md:px-0">
        <MemosList memos={memos} />
      </div>

      {memos.length === 0 && (
        <p className="text-muted-foreground mt-8">No memos yet.</p>
      )}
    </div>
  );
}
