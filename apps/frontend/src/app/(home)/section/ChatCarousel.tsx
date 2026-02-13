"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Message {
  id: number;
  role: string;
  content: string;
}

const message: Message[] = [
  {
    id: 1,
    role: "right",
    content: "⁕ % ⁖ - ● ⁕ ⁖ -",
  },
  {
    id: 2,
    role: "right",
    content: "● ⁖ - ⁕ ⁕",
  },
  {
    id: 3,
    role: "right",
    content: "💜 💜",
  },
  {
    id: 4,
    role: "left",
    content: "！ ！ ！ ！",
  },
  {
    id: 5,
    role: "right",
    content: "📢 📢 📢",
  },
  {
    id: 6,
    role: "left",
    content: "💢 💢 😅 😅 😅",
  },
  {
    id: 7,
    role: "left",
    content: "● ● ●",
  },
  {
    id: 8,
    role: "left",
    content: "🌀 💢 💢 🥺",
  },
];

export default function ChatCarousel() {
  const [showedMessages, setShowedMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const FIFO = 7;
  useEffect(() => {
    const timer = setTimeout(() => {
      const newMessage = message[currentIndex];
      setShowedMessages((prev) => {
        const update = [...prev, newMessage];
        return update.slice(-FIFO);
      });
      currentIndex < message.length - 1 ? setCurrentIndex(currentIndex + 1) : setCurrentIndex(0);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="h-full w-full flex flex-col gap-4 overflow-hidden">
      {showedMessages.map(message => (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={`${message.role === "left" ? "self-start" : "self-end"} border border-border rounded-lg bg-card px-6 py-2`}
          key={message.id}
        >
          {message.content}
        </motion.div>
      ))}
    </div>
  );
}
