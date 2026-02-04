"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useMotionValue, MotionValue } from "motion/react";

interface MouseContextType {
    x: MotionValue<number>;
    y: MotionValue<number>;
}

const MouseContext = createContext<MouseContextType | null>(null);

export const useMouse = () => {
    const context = useContext(MouseContext);
    if (!context) {
        throw new Error("useMouse must be used within a MouseProvider");
    }
    return context;
};

export const MouseProvider = ({ children }: { children: React.ReactNode }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Normalize to -0.5 to 0.5
            x.set(e.clientX / window.innerWidth - 0.5);
            y.set(e.clientY / window.innerHeight - 0.5);
        };

        const handleMouseLeave = () => {
            x.set(0);
            y.set(0);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [x, y]);

    return (
        <MouseContext.Provider value={{ x, y }}>
            {children}
        </MouseContext.Provider>
    );
};
