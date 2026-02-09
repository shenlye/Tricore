import type { BangumiCollection } from "@/lib/bangumi";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { fetchBangumiCollections } from "@/lib/bangumi";

interface BangumiSectionProps {
  sectionNo: string;
  title: string;
  description: string;
  subjectType: 2 | 4;
  labels: {
    done: string;
    doing: string;
    wish: string;
  };
}

function SmallCard({
  item,
  label,
}: {
  item: BangumiCollection;
  label?: string;
}) {
  const subject = item.subject;
  const name = subject.name_cn || subject.name;

  return (
    <Link
      href={`https://bgm.tv/subject/${subject.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2.5 md:p-3 flex flex-col justify-center gap-0.5 min-w-0 h-full relative group transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
    >
      {subject.score > 0 && (
        <span className="absolute top-1.5 right-2 text-[9px] font-mono text-muted-foreground/40 group-hover:text-primary-foreground/60 transition-colors">
          {subject.score.toFixed(1)}
        </span>
      )}
      {label && (
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest group-hover:text-primary-foreground/80 transition-colors">
          {label}
        </span>
      )}
      <p className="text-[11px] md:text-xs font-medium leading-tight line-clamp-2 pr-6">{name}</p>
      {item.comment
        ? (
            <p className="text-[10px] mt-1 border-l-2 border-primary pl-2 line-clamp-1 min-h-[1.5em] group-hover:border-primary-foreground/50">
              <span className="text-muted-foreground group-hover:text-primary-foreground/80 transition-colors">{item.comment}</span>
            </p>
          )
        : (
            <p className="text-[10px] mt-1 text-muted-foreground/60 line-clamp-1 min-h-[1.5em] group-hover:text-primary-foreground/60 transition-colors">
              {subject.name}
            </p>
          )}
      {item.rate > 0 && (
        <div className="flex items-center gap-1 mt-auto pt-0.5">
          <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-0.5 group-hover:text-primary-foreground/80 transition-colors">
            我的评价
            {item.rate}
          </span>
        </div>
      )}
    </Link>
  );
}

function EmptyCell({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-full p-3">
      <span className="text-[11px] text-muted-foreground">
        —
        {" "}
        {text}
      </span>
    </div>
  );
}

export default async function BangumiSection({
  sectionNo,
  title,
  description,
  subjectType,
  labels,
}: BangumiSectionProps) {
  const [doneRes, doingRes, wishRes] = await Promise.all([
    fetchBangumiCollections(subjectType, "done", 2),
    fetchBangumiCollections(subjectType, "doing", 2),
    fetchBangumiCollections(subjectType, "wish", 2),
  ]);

  const doneTotal = doneRes.total;
  const doingTotal = doingRes.total;
  const wishTotal = wishRes.total;
  const doingItems: BangumiCollection[] = doingRes.data.slice(0, 2);
  const doneItems: BangumiCollection[] = doneRes.data.slice(0, 2);
  const wishItems: BangumiCollection[] = wishRes.data.slice(0, 2);

  return (
    <section className="w-full border-b border-border">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        <div className="border-b md:border-b-0 border-r border-border p-4 md:p-5 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono text-muted-foreground tracking-widest">
              {sectionNo}
              .
              {title}
            </span>
            <h2 className="text-lg md:text-2xl font-bold tracking-tight mt-1.5">
              {title}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed hidden md:block">
              {description}
            </p>
          </div>
          <div className="mt-3 md:mt-4 flex flex-col gap-1.5 md:gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl md:text-2xl font-bold font-mono text-primary">{doneTotal}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{labels.done}</span>
            </div>
            <div className="flex gap-2.5 md:gap-3 text-[9px] md:text-[10px] font-mono text-muted-foreground">
              <span>
                {doingTotal}
                {" "}
                {labels.doing}
              </span>
              <span>
                {wishTotal}
                {" "}
                {labels.wish}
              </span>
            </div>
            <Link
              href="/bangumi"
              className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
            >
              <Icon icon="mdi:arrow-right" className="text-[10px] group-hover:text-primary transition-colors" />
              查看全部
            </Link>
          </div>
        </div>

        {/* ── DOING ── */}
        <div className="border-b md:border-b-0 md:border-r border-border flex flex-col">
          <div className="px-3 md:px-4 pt-2.5 md:pt-3 pb-1.5 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                {labels.doing}
              </span>
            </div>
            <Link
              href="/bangumi"
              className="text-[9px] font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              MORE →
            </Link>
          </div>
          <div className="flex-1 flex flex-col divide-y divide-border">
            {doingItems[0]
              ? <SmallCard item={doingItems[0]} />
              : <EmptyCell text={labels.doing} />}
            {doingItems[1]
              ? <SmallCard item={doingItems[1]} />
              : <EmptyCell text={labels.doing} />}
          </div>
        </div>

        {/* ── WISH ── */}
        <div className="border-b md:border-b-0 md:border-r border-border flex flex-col">
          <div className="px-3 md:px-4 pt-2.5 md:pt-3 pb-1.5 flex items-center gap-1.5 border-b border-border">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              {labels.wish}
            </span>
          </div>
          <div className="flex-1 flex flex-col divide-y divide-border">
            {wishItems[0]
              ? <SmallCard item={wishItems[0]} />
              : <EmptyCell text={labels.wish} />}
            {wishItems[1]
              ? <SmallCard item={wishItems[1]} />
              : <EmptyCell text={labels.wish} />}
          </div>
        </div>

        {/* ── DONE ── */}
        <div className="border-b md:border-b-0 border-border flex flex-col">
          <div className="px-3 md:px-4 pt-2.5 md:pt-3 pb-1.5 flex items-center gap-1.5 border-b border-border">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
              {labels.done}
            </span>
          </div>
          <div className="flex-1 flex flex-col divide-y divide-border">
            {doneItems[0]
              ? <SmallCard item={doneItems[0]} />
              : <EmptyCell text={labels.done} />}
            {doneItems[1]
              ? <SmallCard item={doneItems[1]} />
              : <EmptyCell text={labels.done} />}
          </div>
        </div>
      </div>
    </section>
  );
}
