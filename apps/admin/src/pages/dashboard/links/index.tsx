import { ExternalLink, Link2, MoreVertical, Pencil, Plus, Rss, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/pages/dashboard/layout";
import { CreateLinkDialog } from "./CreateLinkDialog";
import { DeleteLinkDialog } from "./DeleteLinkDialog";
import { EditLinkDialog } from "./EditLinkDialog";
import { useLinks } from "./hooks/useLinks";

const ITEMS_PER_PAGE = 12;

export default function LinksPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<number | null>(null);
  const [selectedLinkTitle, setSelectedLinkTitle] = useState("");

  const { data, isLoading } = useLinks(page, ITEMS_PER_PAGE);

  const links = data?.data || [];
  const meta = data?.meta;

  const filteredLinks = links.filter(
    link =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase())
      || link.link.toLowerCase().includes(searchQuery.toLowerCase())
      || (link.desc && link.desc.toLowerCase().includes(searchQuery.toLowerCase()))
      || (link.category && link.category.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleEdit = (id: number) => {
    setSelectedLinkId(id);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: number, title: string) => {
    setSelectedLinkId(id);
    setSelectedLinkTitle(title);
    setDeleteDialogOpen(true);
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }
    catch {
      return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">友链管理</h1>
            <p className="text-muted-foreground">
              管理您的友情链接，共
              {" "}
              {meta?.total || 0}
              {" "}
              个友链
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            添加友链
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索友链名称、链接、描述或分类..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Links Grid */}
        {isLoading
          ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Card key={`skeleton-${index}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          : filteredLinks.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Link2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">暂无友链</h3>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    {searchQuery
                      ? "没有找到匹配的友链，请尝试其他搜索词"
                      : "您还没有添加任何友链，点击上方按钮添加第一个友链吧"}
                  </p>
                </div>
              )
            : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredLinks.map(link => (
                    <Card key={link.id} className="group overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                              {link.avatar
                                ? (
                                    <img
                                      src={link.avatar}
                                      alt={link.title}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        const favicon = getFaviconUrl(link.link);
                                        if (favicon) {
                                          (e.target as HTMLImageElement).src = favicon;
                                        }
                                      }}
                                    />
                                  )
                                : (
                                    <img
                                      src={getFaviconUrl(link.link) || ""}
                                      alt={link.title}
                                      className="h-full w-full object-cover"
                                    />
                                  )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base truncate" title={link.title}>
                                {link.title}
                              </CardTitle>
                              {link.category && (
                                <CardDescription className="text-xs truncate">
                                  {link.category}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(link.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(link.id, link.title)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {link.desc && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {link.desc}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8"
                            asChild
                          >
                            <a
                              href={link.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              访问
                            </a>
                          </Button>
                          {link.feed && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              asChild
                            >
                              <a
                                href={link.feed}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="RSS Feed"
                              >
                                <Rss className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

        {/* Pagination */}
        {meta && meta.total > ITEMS_PER_PAGE && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.ceil(meta.total / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(
                pageNum => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setPage(pageNum)}
                      isActive={page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage(p => Math.min(Math.ceil(meta.total / ITEMS_PER_PAGE), p + 1))}
                  className={
                    page >= Math.ceil(meta.total / ITEMS_PER_PAGE)
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Dialogs */}
      <CreateLinkDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <EditLinkDialog
        linkId={selectedLinkId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <DeleteLinkDialog
        linkId={selectedLinkId}
        linkTitle={selectedLinkTitle}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </DashboardLayout>
  );
}
