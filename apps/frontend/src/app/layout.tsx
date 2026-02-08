import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import { MouseProvider } from "@/components/MouseContext";
import { MainContent, NavProvider } from "@/components/NavContext";
import Sidebar from "@/components/Sidebar";
import SmoothScroll from "@/components/SmoothScroll";
import TopBar from "@/components/TopBar";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${notoSansSC.variable}`}>
      <body
        className="antialiased scroll-box"
      >
        <SmoothScroll>
          <MouseProvider>
            <NavProvider>
              <TopBar />
              <Sidebar />
              <MainContent>{children}</MainContent>
            </NavProvider>
          </MouseProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
