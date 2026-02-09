import { Suspense } from "react";
import BangumiSection from "@/components/BangumiSection";
import HeroSection from "@/components/HeroSection";

function BangumiSkeleton() {
  return (
    <section className="w-full border-b border-border">
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr] md:grid-rows-[1fr_1fr]">
        <div className="md:row-span-2 border-b md:border-b-0 md:border-r border-border p-6">
          <div className="h-3 w-16 bg-muted" />
          <div className="h-8 w-28 bg-muted mt-2" />
          <div className="h-3 w-40 bg-muted mt-2" />
          <div className="h-10 w-20 bg-muted mt-8" />
        </div>
        <div className="md:row-span-2 border-b md:border-b-0 md:border-r border-border h-64" />
        <div className="border-b md:border-r border-border h-48" />
        <div className="border-b border-border h-48" />
        <div className="border-b md:border-b-0 md:border-r border-border h-48" />
        <div className="border-b md:border-b-0 border-border h-48" />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="mx-auto border border-border max-w-7xl w-full min-h-screen flex flex-col">
      <HeroSection />

      <div className="min-h-screen flex flex-col">
        <div className="border border-border px-6 md:px-10 py-10 md:py-16">
          <p className="text-xs md:text-sm font-mono text-muted-foreground uppercase tracking-widest">
            Collection
          </p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mt-3">
            动画与游戏收藏
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
            我的动画与游戏收藏，数据来自 Bangumi。
          </p>
        </div>

        <Suspense fallback={<BangumiSkeleton />}>
          <BangumiSection
            sectionNo="02"
            title="ANIME"
            description="追番记录，来自 Bangumi。"
            subjectType={2}
            labels={{ done: "看过", doing: "在看", wish: "想看" }}
          />
        </Suspense>

        <Suspense fallback={<BangumiSkeleton />}>
          <BangumiSection
            sectionNo="03"
            title="GAME"
            description="游戏记录，来自 Bangumi。"
            subjectType={4}
            labels={{ done: "玩过", doing: "在玩", wish: "想玩" }}
          />
        </Suspense>
      </div>
    </div>
  );
}
