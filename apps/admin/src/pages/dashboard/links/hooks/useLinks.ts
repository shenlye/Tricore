import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api";

export function useLinks(page: number, limit: number) {
  return useQuery({
    queryKey: ["links", page, limit],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await client.api.v1.links.$get({
        query: {
          page: page.toString(),
          limit: limit.toString(),
        },
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok)
        throw new Error("Failed to fetch links");
      return res.json();
    },
  });
}

export function useLink(id: number | undefined) {
  return useQuery({
    queryKey: ["link", id],
    queryFn: async () => {
      if (id === undefined)
        return null;
      const token = localStorage.getItem("token");
      const res = await client.api.v1.links[":id"].$get({
        param: { id: id.toString() },
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok)
        throw new Error("Failed to fetch link details");
      return res.json();
    },
    enabled: id !== undefined,
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: {
      title: string;
      link: string;
      avatar?: string;
      desc?: string;
      date?: string;
      feed?: string;
      comment?: string;
      category?: string;
    }) => {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("No token found");

      const res = await client.api.v1.links.$post({
        json: values,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to create link");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("友链已创建");
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: {
      id: number;
      values: {
        title?: string;
        link?: string;
        avatar?: string;
        desc?: string;
        date?: string;
        feed?: string;
        comment?: string;
        category?: string;
      };
    }) => {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("No token found");

      const res = await client.api.v1.links[":id"].$put({
        param: { id: id.toString() },
        json: values,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to update link");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("友链已更新");
      queryClient.invalidateQueries({ queryKey: ["links"] });
      queryClient.invalidateQueries({ queryKey: ["link"] });
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await client.api.v1.links[":id"].$delete({
        param: { id: id.toString() },
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to delete link");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("友链已删除");
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });
}
