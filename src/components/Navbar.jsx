"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Mountain,
  Moon,
  Sun,
  Languages,
} from "lucide-react";

import { useAppSettings } from "@/components/ThemeLanguageProvider";

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const {
  language,
  setLanguage,
  darkMode,
  setDarkMode,
  settingsLoaded,
} = useAppSettings();

const currentLanguage = settingsLoaded ? language : "en";

  const navItems = [
    { en: "Home", bn: "হোম", href: "/" },
    { en: "Places", bn: "স্থানসমূহ", href: "/places" },
    { en: "Districts", bn: "জেলাসমূহ", href: "/districts" },
    { en: "Events", bn: "ইভেন্ট", href: "/events" },
    { en: "Travel Guide", bn: "ভ্রমণ গাইড", href: "/travel-guide" },
    { en: "About", bn: "আমাদের সম্পর্কে", href: "/about" },
  ];

  const toggleLanguage = () => {
    setLanguage((current) => (current === "en" ? "bn" : "en"));
  };

  const toggleTheme = () => {
    setDarkMode((current) => !current);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <div className="max-w-[1400px] mx-auto px-5 h-[76px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Mountain size={43} className="text-green-600" />

          <div>
            <h1 className="text-xl font-extrabold text-green-900 dark:text-green-400 leading-tight">
              Bangladesh
              <br />
              Tourism
            </h1>

            <p className="text-[10px] italic text-slate-500 dark:text-slate-400">
              Explore · Discover · Travel
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-green-600 transition"
            >
              {currentLanguage === "en" ? item.en : item.bn}
            </Link>
          ))}
        </nav>

        {/* Language and Theme Controls */}
        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-2 rounded-full bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-400 font-semibold text-sm"
            aria-label="Change language"
          >
            <Languages size={17} />
            {currentLanguage === "en" ? "বাংলা" : "English"}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden p-2 text-slate-700 dark:text-white"
            onClick={() => setMobileMenu((current) => !current)}
            aria-label="Toggle navigation"
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenu && (
        <nav className="lg:hidden flex flex-col gap-4 p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenu(false)}
              className="font-medium text-slate-700 dark:text-slate-200 hover:text-green-600"
            >
              {currentLanguage === "en" ? item.en : item.bn}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}