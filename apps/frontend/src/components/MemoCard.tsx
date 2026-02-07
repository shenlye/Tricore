"use client";

import { Icon } from "@iconify/react";
import { motion, useSpring, useTransform } from "motion/react";
import { useMouse } from "@/hooks/use-mouse";

interface MemoCardProps {
  content: string;
  date: string;
}

export default function MemoCard({ content, date }: MemoCardProps) {
  const { x, y } = useMouse();

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });

  return (
    <div className="block w-full h-full group" style={{ perspective: "2500px" }}>
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative p-4 h-full flex flex-col"
      >
        <div className="absolute inset-0 bg-card/50 backdrop-blur-md -z-10" style={{ transform: "translateZ(0px)" }} />

        <div className="flex items-center gap-2 h-5 mb-3" style={{ transformStyle: "preserve-3d" }}>
          <div className="h-full w-10 bg-foreground flex justify-end items-center" style={{ transform: "translateZ(40px)" }}>
            <Icon icon="lucide:message-square" className="text-lg text-background" />
          </div>
          <div className="font-semibold text-sm" style={{ transform: "translateZ(40px)" }}>MEMO</div>
          <div className="ml-auto text-xs text-muted-foreground" style={{ transform: "translateZ(40px)" }}>
            {date}
          </div>
        </div>

        <div
          className="text-sm text-foreground whitespace-pre-wrap leading-relaxed flex-1"
          style={{ transform: "translateZ(40px)" }}
        >
          {content}
        </div>

        <div className="absolute bottom-0 left-0 w-full h-0.5 z-10 opacity-30 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(to_right,#FF1AAC_23.33%,#01FFA2_23.33%_46.66%,#FFFA00_46.66%_70%,#D9D9D9_70%)]" />
        <div className="absolute -bottom-1 left-0 w-full h-0.5 blur-xs opacity-0 group-hover:opacity-70 transition-opacity duration-300 z-0 bg-[linear-gradient(to_right,#FF1AAC_23.33%,#01FFA2_23.33%_46.66%,#FFFA00_46.66%_70%,#D9D9D9_70%)]" />
      </motion.div>
    </div>
  );
}
