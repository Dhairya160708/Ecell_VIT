import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Cinzel, Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090a08",
};

export const metadata: Metadata = {
  title: "E-Cell VIT · The Scouts of VIT",
  description:
    "The Entrepreneurship Cell of Vidyalankar Institute of Technology. Turning campus curiosity into ventures that move the world forward.",
  icons: { icon: "/brand/crest-sm.png" },
};

// Runs before paint: if the intro already played this session (or motion is reduced), hide its overlay so it never flashes.
const introScript = `try{if(sessionStorage.getItem('ecell-intro-seen')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.intro='seen'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bebas.variable} ${cinzel.variable} ${space.variable} ${dm.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <style>{`[data-intro=seen] .intro-overlay{display:none}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
