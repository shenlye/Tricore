import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shenley",
  description: "Frontend Developer",
};

export default function RootLayout() {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansSC.variable}`} suppressHydrationWarning>
      <body className="antialiased scroll-box [text-autospace:normal] flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">不限期维护</h1>
          <p className="text-zinc-400">Indefinite Maintenance</p>
        </div>
      </body>
    </html>
  );
}
