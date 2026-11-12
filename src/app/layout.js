import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { ThemeLanguageProvider } from "@/components/ThemeLanguageProvider";
import "./globals.css";

export const metadata = {
  title: "Bangladesh Tourism | Explore Beautiful Bangladesh",
  description:
    "Discover the beauty of Bangladesh. Explore tourist attractions, districts, events and travel guides.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeLanguageProvider>
          <Navbar />

          <Suspense
            fallback={
              <main className="min-h-screen bg-[#f7faf8] dark:bg-slate-950" />
            }
          >
            {children}
          </Suspense>
        </ThemeLanguageProvider>
      </body>
    </html>
  );
}