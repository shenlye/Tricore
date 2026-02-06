import type { Post } from "./types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PostsTableProps {
  posts: Post[] | undefined;
  isLoading: boolean;
  skeletonCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
}

export function PostsTable({
  posts,
  isLoading,
  skeletonCount,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: PostsTableProps) {
  return (
    <div className="border">
      <Table>
        <TableHeader className="bg-card">
          <TableRow>
            <TableHead className="w-20">ID</TableHead>
            <TableHead>标题</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>发布时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? (
                Array.from({ length: skeletonCount }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell colSpan={6} className="h-12">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              )
            : posts?.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      暂无文章
                    </TableCell>
                  </TableRow>
                )
              : (
                  posts?.map(post => (
                    <TableRow key={post.id}>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {post.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{post.title || "无标题"}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {post.slug || post.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {post.type === "memo" ? "便签" : "文章"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.isPublished
                          ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">已发布</Badge>
                            )
                          : (
                              <Badge variant="outline" className="text-amber-600 border-amber-200">草稿</Badge>
                            )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(post)}>
                              <Edit className="w-4 h-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete(post.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
        </TableBody>
      </Table>
      {!isLoading && totalPages > 0 && (
        <div className="flex items-center justify-end space-x-6 py-4 border-t px-4">
          <div className="text-sm text-muted-foreground font-medium">
            Page
            {" "}
            {page}
            {" "}
            of
            {" "}
            {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="hidden sm:flex"
            >
              <ChevronsLeft className="h-4 w-4 mr-1" />
              首页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              下一页
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="hidden sm:flex"
            >
              末页
              <ChevronsRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
