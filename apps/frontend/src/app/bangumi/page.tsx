import type { Metadata } from "next";
import type { CollectionType } from "@/lib/bangumi";
import BangumiList from "@/components/BangumiList";
import Pagination from "@/components/Pagination";
import { fetchBangumiCollections } from "@/lib/bangumi";

export const metadata: Metadata = {
  title: "Bangumi | Shenley",
  description: "My anime and game collections from Bangumi.",
};

const TABS: { label: string; type: CollectionType }[] = [
  { label: "Doing", type: "doing" },
  { label: "Done", type: "done" },
  { label: "Wish", type: "wish" },
];

const PAGE_SIZE = 12;

interface Props {
  searchParams: Promise<{ type?: string; page?: string; subject?: string }>;
}

export default async function BangumiPage({ searchParams }: Props) {
  const params = await searchParams;
  const collectionType = (params.type as CollectionType) || "doing";
  const subjectType = params.subject === "game" ? 4 : 2;
  const page = Math.max(1, Number(params.page) || 1);

  let collections;
  let total = 0;

  try {
    const result = await fetchBangumiCollections(
      subjectType as 2 | 4,
      collectionType,
      PAGE_SIZE,
      (page - 1) * PAGE_SIZE,
    );
    collections = result.data;
    total = result.total;
  }
  catch (error) {
    console.error("Error fetching bangumi collections:", error);
    return <div className="py-16 text-center">Failed to fetch collections</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-24 max-w-4xl mx-auto">
      <header className="w-full mb-10 px-4 md:px-0">
        <h1 className="text-4xl font-bold tracking-tight">
          Bangumi
        </h1>
        <p className="mt-4 text-muted-foreground text-md">
          What I&apos;ve been watching and playing.
        </p>
      </header>

      {/* Subject type toggle */}
      <div className="w-full flex gap-6 mb-6 px-4 md:px-0">
        <SubjectTab label="Anime" value="anime" current={subjectType === 2 ? "anime" : "game"} type={collectionType} />
        <SubjectTab label="Game" value="game" current={subjectType === 2 ? "anime" : "game"} type={collectionType} />
      </div>

      {/* Collection type tabs */}
      <div className="w-full flex gap-4 mb-8 px-4 md:px-0">
        {TABS.map(tab => (
          <a
            key={tab.type}
            href={`/bangumi?subject=${subjectType === 4 ? "game" : "anime"}&type=${tab.type}`}
            className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
              collectionType === tab.type
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="w-full px-4 md:px-0">
        <BangumiList key={`${subjectType}-${collectionType}-${page}`} collections={collections} />
      </div>

      {collections.length === 0 && (
        <p className="text-muted-foreground mt-8">No collections yet.</p>
      )}

      <Pagination
        total={total}
        pageSize={PAGE_SIZE}
        currentPage={page}
        basePath="/bangumi"
        extraParams={{ type: collectionType, subject: subjectType === 4 ? "game" : "anime" }}
      />
    </div>
  );
}

function SubjectTab({ label, value, current, type }: { label: string; value: string; current: string; type: string }) {
  const active = value === current;
  return (
    <a
      href={`/bangumi?subject=${value}&type=${type}`}
      className={`text-lg font-semibold transition-colors ${
        active ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground"
      }`}
    >
      {label}
    </a>
  );
}
