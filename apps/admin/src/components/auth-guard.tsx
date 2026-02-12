import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { client } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      if (!token)
        return null;
      const res = await client.api.v1.auth.me.$get({}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to verify token");
      }

      const result = await res.json();

      return result.data;
    },
    enabled: !!token,
    retry: false,
  });

  // 如果没有 token，直接跳转到登录页
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 如果有 token 但验证失败（例如 token 过期），清除 token 并跳转到登录页
  if (error || !user) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  // 验证成功，渲染子组件
  return <>{children}</>;
}
