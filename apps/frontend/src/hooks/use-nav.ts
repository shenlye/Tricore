"use client";

import { createContext, use } from "react";

export interface NavContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

export const NavContext = createContext<NavContextValue>({
  isOpen: false,
  toggle: () => {},
  close: () => {},
});

export function useNav() {
  return use(NavContext);
}
