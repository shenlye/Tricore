import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api";

export function usePosts(page: number, limit: number) {
  return useQuery({
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
}

export function usePost(slug: string | undefined) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      if (!slug)
        return null;
      const res = await client.api.v1.posts[":slug"].$get({
        param: { slug },
      });
      if (!res.ok)
        throw new Error("Failed to fetch post details");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: number; values: any }) => {
      const token = localStorage.getItem("token");
      const res = await client.api.v1.posts[":id"].$patch({
        param: { id: id.toString() },
        json: values,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok)
        throw new Error("Failed to update post");
      return res.json();
    },
    onSuccess: () => {
      toast.success("文章已更新");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
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
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });
}
