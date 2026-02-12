"use client";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

export default function Test() {
  useGSAP(() => {
    gsap.to(".h-2", {
      width: "100%",
      duration: 1,
    });
  });

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <h1 className="h-2 w-2">Test</h1>
    </div>
  );
}
