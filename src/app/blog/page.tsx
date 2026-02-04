import PostCard from "@/components/PostCard";

export default function home() {
    return <div className="flex flex-col justify-center items-center gap-8 p-2 perspective-[2500px]">
        <PostCard />
        <PostCard />
        <PostCard />
    </div>;
}