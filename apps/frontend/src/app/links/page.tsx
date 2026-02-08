import type { Metadata } from "next";
import LinksList from "@/components/LinksList";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Links | Shenley",
  description: "Friends and interesting sites.",
};

export default async function LinksPage() {
  let linksRes;
  try {
    linksRes = await api.api.v1.links.$get({ query: { limit: "100" } });
  }
  catch (error) {
    console.error("Error fetching links:", error);
    return <div className="py-16 text-center">Failed to fetch links</div>;
  }

  if (!linksRes.ok) {
    console.error("Failed to fetch links:", linksRes.statusText);
    return <div className="py-16 text-center">Failed to fetch links</div>;
  }

  const { data: links } = await linksRes.json();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-24 max-w-4xl mx-auto">
      <header className="w-full mb-16 px-4 md:px-0">
        <h1 className="text-4xl font-bold tracking-tight">
          Station
        </h1>
        <p className="mt-4 text-muted-foreground text-md">
          Interesting souls and useful tools.
        </p>
      </header>

      <div className="w-full px-4 md:px-0">
        <LinksList links={links} />
      </div>

      {links.length === 0 && (
        <p className="text-muted-foreground mt-8">No links yet.</p>
      )}
    </div>
  );
}
