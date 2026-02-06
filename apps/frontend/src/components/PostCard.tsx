"use client";
import { Icon } from "@iconify/react";
import { motion, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMouse } from "@/hooks/use-mouse";

interface PostCardProps {
  title: string;
  description: string;
  category: string;
  date: string;
  slug: string;
  image?: string;
}

export default function PostCard({ title, description, category, date, slug, image = "/bg.jpg" }: PostCardProps) {
  const { x, y } = useMouse();
  const [imgError, setImgError] = useState(false);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });

  return (
    <Link href={`/blog/${slug}`} className="block w-full max-w-2xl group" style={{ perspective: "2500px" }}>
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="flex flex-col md:flex-row text-card-foreground p-2 relative gap-4 items-stretch w-full"
      >
        <div className="absolute inset-0 bg-card/50 backdrop-blur-md -z-10" style={{ transform: "translateZ(0px)" }}></div>

        <div className="flex-1 flex flex-col justify-between gap-2 order-2 md:order-1 " style={{ transformStyle: "preserve-3d" }}>
          <div className="h-5 flex items-center gap-2 " style={{ transformStyle: "preserve-3d" }}>
            <div className="h-full w-14 bg-foreground flex justify-end items-center" style={{ transform: "translateZ(40px)" }}>
              <Icon
                icon="lucide:arrow-down-right"
                className="text-3xl text-background"
              />
            </div>
            <div className="font-semibold text-lg" style={{ transform: "translateZ(40px)" }}>POST</div>
          </div>

          <div className="flex flex-col gap-2" style={{ transformStyle: "preserve-3d" }}>
            <div className="relative inline-block pr-6" style={{ transformStyle: "preserve-3d" }}>
              <div className="absolute bottom-0 left-0 w-full h-[30%] bg-foreground/10 z-0"></div>
              <div className="text-md md:text-xl font-bold relative z-10 " style={{ transform: "translateZ(40px)" }}>
                {title}
              </div>
            </div>
            <div className="line-clamp-3 md:text-sm text-xs text-muted-foreground" style={{ transform: "translateZ(40px)" }}>
              {description}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-end shrink-0 order-1 md:order-2 gap-2 md:gap-0" style={{ transformStyle: "preserve-3d" }}>
          <div className="w-full flex justify-between bg-muted h-5 px-2 py-0.5 text-xs text-muted-foreground" style={{ transform: "translateZ(40px)" }}>
            <div className="flex gap-1">
              <div>&#47;&#47;</div>
              <div>{category}</div>
            </div>
            <div>{date}</div>
          </div>

          <div className="w-full md:w-auto md:h-25 h-auto aspect-21/9 overflow-hidden relative" style={{ transform: "translateZ(40px)" }}>
            {image && !imgError
              ? (
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover object-center"
                    onError={() => setImgError(true)}
                  />
                )
              : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Icon icon="lucide:image-off" className="text-muted-foreground text-2xl" />
                  </div>
                )}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 w-full h-0.5 z-10 opacity-30 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(to_right,#FF1AAC_23.33%,#01FFA2_23.33%_46.66%,#FFFA00_46.66%_70%,#D9D9D9_70%)]"
        >
        </div>
        <div
          className="absolute -bottom-1 left-0 w-full h-0.5 blur-xs opacity-0 group-hover:opacity-70 transition-opacity duration-300 z-0 bg-[linear-gradient(to_right,#FF1AAC_23.33%,#01FFA2_23.33%_46.66%,#FFFA00_46.66%_70%,#D9D9D9_70%)]"
        >
        </div>
      </motion.div>
    </Link>
  );
}
