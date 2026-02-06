"use client";

import type { MotionValue } from "motion/react";
import { createContext, use } from "react";

export interface MouseContextType {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export const MouseContext = createContext<MouseContextType | null>(null);

export function useMouse() {
  const context = use(MouseContext);
  if (!context) {
    throw new Error("useMouse must be used within a MouseProvider");
  }
  return context;
}
