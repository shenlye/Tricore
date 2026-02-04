import PostCard from "@/components/PostCard";

export default function home() {
    return <div className="flex flex-col justify-center items-center gap-8 py-16 px-2 perspective-[2500px]">
        <PostCard
            title="Next.js App Router 最佳实践"
            description="深入探讨 Next.js App Router 的核心概念，包括服务端组件、客户端组件以及如何优化性能。"
            category="技术"
            date="2024.02.04"
            slug="nextjs-app-router-best-practices"
        />
        <PostCard
            title="Framer Motion 动画指南"
            description="学习如何使用 Framer Motion 为你的 React 应用添加丝滑的 3D 卡片悬停效果。"
            category="设计"
            date="2024.02.05"
            slug="framer-motion-animation-guide"
        />
    </div>;
}