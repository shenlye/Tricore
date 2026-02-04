"use client";
import { Icon } from "@iconify/react";
import { useMouse } from "@/components/MouseContext";
import { motion, useSpring, useTransform } from "motion/react";

export default function PostCard() {
    const { x, y } = useMouse();

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });

    return (
        <motion.div style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
        }} className="flex max-w-2xl bg-card text-card-foreground p-2 relative gap-4 items-stretch w-full">
            <div className="flex-1 flex flex-col justify-between gap-1 " style={{ transformStyle: "preserve-3d" }}>
                <div className="h-5 flex items-center gap-2 " style={{ transformStyle: "preserve-3d" }}>
                    <div className="h-full w-14 bg-foreground flex justify-end items-center" style={{ transform: "translateZ(20px)" }}>
                        <Icon
                            icon="lucide:arrow-down-right"
                            className="text-3xl text-background"
                        />
                    </div>
                    <div className="font-semibold text-lg" style={{ transform: "translateZ(20px)" }}>POST</div>
                </div>

                <div className="flex flex-col gap-2" style={{ transformStyle: "preserve-3d" }}>
                    <div className="relative inline-block pr-6" style={{ transformStyle: "preserve-3d" }}>
                        <div className="absolute bottom-0 left-0 w-full h-[30%] bg-foreground/10 z-0"></div>
                        <div className="text-2xl font-bold relative z-10" style={{ transform: "translateZ(30px)" }}>
                            测试标题
                        </div>
                    </div>
                    <div className="line-clamp-3 text-sm text-muted-foreground" style={{ transform: "translateZ(30px)" }}>
                        描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述述描述描述
                    </div>
                </div>
            </div>

            {/* 右侧列：宽度由图片比例决定 */}
            <div className="flex flex-col justify-between items-end shrink-0" style={{ transformStyle: "preserve-3d" }}>
                {/* 分类区域：会自动填充到图片的宽度 */}
                <div className="w-full flex justify-between bg-muted h-5 px-2 py-0.5 text-xs text-muted-foreground" style={{ transform: "translateZ(20px)" }}>
                    <div className="flex gap-1">
                        <div>//</div>
                        <div>分类</div>
                    </div>
                    <div>2025.07.23</div>
                </div>

                <div className="md:h-25 h-20 aspect-21/9  overflow-hidden" style={{ transform: "translateZ(40px)" }}>
                    <img
                        src="/bg.jpg"
                        alt="Post Background"
                        className="w-full h-full object-cover object-center"
                    />
                </div>
            </div>

            <div
                className="absolute bottom-0 left-0 w-full h-0.5 z-10 bg-[linear-gradient(to_right,#FF1AAC_23.33%,#01FFA2_23.33%_46.66%,#FFFA00_46.66%_70%,#D9D9D9_70%)]"
            ></div>
            <div
                className="absolute -bottom-1 left-0 w-full h-0.5 blur-xs opacity-70 z-0 bg-[linear-gradient(to_right,#FF1AAC_23.33%,#01FFA2_23.33%_46.66%,#FFFA00_46.66%_70%,#D9D9D9_70%)]"
            ></div>
        </motion.div>
    );
}
