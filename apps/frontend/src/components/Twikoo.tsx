"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

interface TwikooProps {
  envId: string;
}

export default function Twikoo({ envId }: TwikooProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initTwikoo = useCallback(() => {
    if ((window as any).twikoo) {
      (window as any).twikoo.init({
        envId,
        el: "#tcomment",
      });
    }
  }, [envId]);

  useEffect(() => {
    initTwikoo();
  }, [initTwikoo]);

  return (
    <div className="mt-16 pt-8 border-t border-border">
      <Script
        src="https://lib.baomitu.com/twikoo/1.6.44/twikoo.min.js"
        onLoad={initTwikoo}
      />
      <div id="tcomment" ref={containerRef}></div>
    </div>
  );
}
