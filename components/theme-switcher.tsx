"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
        aria-label="Switch theme"
      >
        {theme === "light" ? (
          <Sun size={18} className="text-amber-500" />
        ) : theme === "dark" ? (
          <Moon size={18} className="text-indigo-400" />
        ) : (
          <Laptop size={18} className="text-neutral-500 dark:text-neutral-400" />
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
          <button
            onClick={() => changeTheme("light")}
            className={`flex items-center w-full px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-t-lg ${
              theme === "light" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <Sun size={16} className={`mr-2 ${theme === "light" ? "text-amber-500" : "text-neutral-500 dark:text-neutral-400"}`} />
            Light
          </button>
          <button
            onClick={() => changeTheme("dark")}
            className={`flex items-center w-full px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
              theme === "dark" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <Moon size={16} className={`mr-2 ${theme === "dark" ? "text-indigo-400" : "text-neutral-500 dark:text-neutral-400"}`} />
            Dark
          </button>
          <button
            onClick={() => changeTheme("system")}
            className={`flex items-center w-full px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-b-lg ${
              theme === "system" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <Laptop size={16} className={`mr-2 ${theme === "system" ? "text-primary-500" : "text-neutral-500 dark:text-neutral-400"}`} />
            System
          </button>
        </div>
      )}
    </div>
  );
};

export { ThemeSwitcher };
