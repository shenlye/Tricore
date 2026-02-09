import Link from "next/link";

interface PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
  basePath: string;
  extraParams?: Record<string, string>;
}

function buildHref(basePath: string, page: number, extraParams: Record<string, string>) {
  const params = new URLSearchParams(extraParams);
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export default function Pagination({ total, pageSize, currentPage, basePath, extraParams = {} }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1)
    return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {currentPage > 1
        ? (
            <Link
              href={buildHref(basePath, currentPage - 1, extraParams)}
              className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <span className="i-lucide-chevron-left w-4 h-4">←</span>
            </Link>
          )
        : (
            <span className="p-2 rounded-md border border-border text-muted-foreground opacity-30">
              <span className="w-4 h-4">←</span>
            </span>
          )}

      <span className="text-sm text-muted-foreground px-3">
        {currentPage}
        {" / "}
        {totalPages}
      </span>

      {currentPage < totalPages
        ? (
            <Link
              href={buildHref(basePath, currentPage + 1, extraParams)}
              className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <span className="w-4 h-4">→</span>
            </Link>
          )
        : (
            <span className="p-2 rounded-md border border-border text-muted-foreground opacity-30">
              <span className="w-4 h-4">→</span>
            </span>
          )}
    </div>
  );
}
