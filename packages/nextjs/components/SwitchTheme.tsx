"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme("dark");
  }, [setTheme]);

  if (!mounted) return null;

  return (
    <div className={`flex space-x-2 h-8 items-center justify-center text-sm ${className}`}>
      <input
        id="theme-toggle"
        type="checkbox"
        className="toggle toggle-primary bg-primary hover:bg-primary border-primary"
        onChange={() => {
          return;
        }}
        checked={true}
        readOnly
      />
      <label htmlFor="theme-toggle" className="swap swap-rotate">
        <SunIcon className="swap-on h-5 w-5" />
        <MoonIcon className="swap-off h-5 w-5" />
      </label>
    </div>
  );
};
