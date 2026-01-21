import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api";

export function usePosts(page: number, limit: number) {
  return useQuery({
    queryKey: ["posts", page, limit],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await client.api.v1.posts.$get({
        query: {
          page: page.toString(),
          limit: limit.toString(),
        },
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
      const token = localStorage.getItem("token");
      const res = await client.api.v1.posts[":slug"].$get({
        param: { slug },
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok)
        throw new Error("Failed to fetch post details");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function usePostById(id: number | undefined) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      if (id === undefined)
        return null;
      const token = localStorage.getItem("token");
      const res = await client.api.v1.posts.id[":id"].$get({
        param: { id: id.toString() },
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok)
        throw new Error("Failed to fetch post details");
      return res.json();
    },
    enabled: id !== undefined,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("No token found");
      const res = await client.api.v1.posts.$post({
        json: values,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json() as any;
        throw new Error(errorData.error?.message || "Failed to create post");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("文章已创建");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: number; values: any }) => {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("No token found");
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
