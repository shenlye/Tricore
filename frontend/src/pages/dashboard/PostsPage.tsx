import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { client } from "@/lib/api";
import DashboardLayout from "./layout";

export default function PostsPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["posts", page],
    queryFn: async () => {
      const res = await client.api.v1.posts.$get({
        query: {
          page: page.toString(),
          limit: limit.toString(),
        },
      });
      if (!res.ok)
        throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / limit) : 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await client.api.v1.posts[":id"].$delete({
        param: { id: id.toString() },
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok)
        throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      toast.success("文章已删除");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            文章管理
          </h1>
          <Button onClick={() => toast.info("创建文章功能即将推出")}>
            <Plus className="w-4 h-4 mr-2" />
            新建文章
          </Button>
        </div>

        <div className="border">
          <Table>
            <TableHeader>
              <TableRow>
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
                    Array.from({ length: limit }).map((_, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell colSpan={5} className="h-12">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  )
                : data?.data?.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          暂无文章
                        </TableCell>
                      </TableRow>
                    )
                  : (
                      data?.data?.map((post: any) => (
                        <TableRow key={post.id}>
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
                                <DropdownMenuItem onClick={() => toast.info("编辑功能即将推出")}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteId(post.id)}
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
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="hidden sm:flex"
                >
                  <ChevronsLeft className="h-4 w-4 mr-1" />
                  首页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages)}
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
      </div>
      <Dialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确定要删除这篇文章吗？</DialogTitle>
            <DialogDescription>
              此操作无法撤销。这将永久删除该文章及其相关数据。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "正在删除..." : "确定删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
