"use client";
import { Icon } from "@iconify/react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useMouse } from "@/hooks/use-mouse";

export type PostCardVariant = "default" | "cyber" | "sunset" | "mono";

const VARIANT_GRADIENTS: Record<PostCardVariant, string> = {
  default: "bg-[linear-gradient(to_right,#FF1AAC_23.33%,#01FFA2_23.33%_46.66%,#FFFA00_46.66%_70%,#D9D9D9_70%)]",
  cyber: "bg-[linear-gradient(to_right,#00F0FF_0%,#0066FF_33%,#8B5CF6_66%,#D946EF_100%)]",
  sunset: "bg-[linear-gradient(to_right,#FF6B35_0%,#FF1744_33%,#D500F9_66%,#651FFF_100%)]",
  mono: "bg-[linear-gradient(to_right,#FFFFFF_0%,#A0A0A0_33%,#505050_66%,#202020_100%)]",
};

const VARIANT_LABEL_COLORS: Record<PostCardVariant, string> = {
  default: "bg-foreground",
  cyber: "bg-[#0066FF]",
  sunset: "bg-[#FF1744]",
  mono: "bg-foreground/60",
};

interface PostCardProps {
  title: string;
  description: string;
  category: string;
  date: string;
  slug: string;
  image?: string;
  variant?: PostCardVariant;
  reversed?: boolean;
}

export default function PostCard({ title, description, category, date, slug, image = "/bg.jpg", variant = "default", reversed = false }: PostCardProps) {
  const { x, y } = useMouse();
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 150, damping: 20 });

  // Scroll-based parallax: track card position in viewport
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Text moves slightly faster (floats up), image lags behind — subtle effect
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -8]);
  const imageY = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);
  const labelY = useTransform(scrollYProgress, [0, 0.5, 1], [4, 0, -4]);

  // Smooth spring wrappers for buttery parallax
  const smoothTextY = useSpring(textY, { stiffness: 120, damping: 30 });
  const smoothImageY = useSpring(imageY, { stiffness: 120, damping: 30 });
  const smoothLabelY = useSpring(labelY, { stiffness: 120, damping: 30 });

  const gradient = VARIANT_GRADIENTS[variant];
  const labelColor = VARIANT_LABEL_COLORS[variant];

  const textOrder = reversed ? "order-2 @lg:order-2" : "order-2 @lg:order-1";
  const imageOrder = reversed ? "order-1 @lg:order-1" : "order-1 @lg:order-2";

  return (
    <Link ref={cardRef} href={`/blog/${slug}`} className="block group @container" style={{ perspective: "2500px" }}>
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="flex flex-col @lg:flex-row text-card-foreground p-2 relative gap-4 items-stretch w-full "
      >
        <div className="absolute inset-0 bg-card/50 backdrop-blur-md -z-10" style={{ transform: "translateZ(0px)" }}></div>

        <motion.div style={{ y: smoothTextY, transformStyle: "preserve-3d" }} className={`flex-1 flex flex-col justify-between gap-2 ${textOrder}`}>
          <motion.div style={{ y: smoothLabelY, transformStyle: "preserve-3d" }} className="h-5 flex items-center gap-2">
            <div className={`h-full w-14 ${labelColor} flex justify-end items-center`} style={{ transform: "translateZ(40px)" }}>
              <Icon
                icon="lucide:arrow-down-right"
                className="text-3xl text-background"
              />
            </div>
            <div className="font-semibold text-lg" style={{ transform: "translateZ(40px)" }}>POST</div>
          </motion.div>

          <div className="flex flex-col gap-2" style={{ transformStyle: "preserve-3d" }}>
            <div className="relative inline-block pr-6" style={{ transformStyle: "preserve-3d" }}>
              <div className="absolute bottom-0 left-0 w-full h-[30%] bg-foreground/10 z-0"></div>
              <div className="text-md @lg:text-xl font-bold relative z-10" style={{ transform: "translateZ(40px)" }}>
                {title}
              </div>
            </div>
            <div className="line-clamp-3 @lg:text-sm text-xs text-muted-foreground" style={{ transform: "translateZ(40px)" }}>
              {description}
            </div>
          </div>
        </motion.div>

        <motion.div style={{ y: smoothImageY, transformStyle: "preserve-3d" }} className={`flex flex-col justify-between items-end shrink-0 ${imageOrder} gap-2 @lg:gap-0`}>
          <div className="w-full flex justify-between bg-muted h-5 px-2 py-0.5 text-xs text-muted-foreground" style={{ transform: "translateZ(40px)" }}>
            <div className="flex gap-1">
              <div>&#47;&#47;</div>
              <div>{category}</div>
            </div>
            <div>{date}</div>
          </div>

          <div className="w-full @lg:w-auto @lg:h-25 h-auto aspect-21/9 overflow-hidden relative" style={{ transform: "translateZ(40px)" }}>
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
        </motion.div>

        <div
          className={`absolute bottom-0 left-0 w-full h-0.5 z-10 opacity-30 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`}
        >
        </div>
        <div
          className={`absolute -bottom-1 left-0 w-full h-0.5 blur-xs opacity-0 group-hover:opacity-70 transition-opacity duration-300 z-0 ${gradient}`}
        >
        </div>
      </motion.div>
    </Link>
  );
}
