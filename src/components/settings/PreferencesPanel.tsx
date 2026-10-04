"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "xcollab-theme";

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === "dark";
  // Fall back to the OS preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function PreferencesPanel() {
  // Initialise to false (light) for SSR; corrected on first client render.
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync state from localStorage / OS preference after hydration.
  useEffect(() => {
    const dark = getInitialTheme();
    setIsDark(dark);
    applyTheme(dark);
    setMounted(true);
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  return (
    <div className="grid max-w-xl gap-0 divide-y divide-slate-100 rounded border border-slate-200 bg-white text-sm">

      {/* ── Dark mode ── */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="font-medium text-slate-700">Dark mode</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Switch the dashboard to a dark colour scheme.
          </p>
        </div>

        {/* Controlled toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label="Enable dark mode"
          onClick={toggleDarkMode}
          // Suppress hydration mismatch: keep the toggle visually inert until
          // the client has read localStorage (mounted = true).
          disabled={!mounted}
          className={[
            "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500",
            "disabled:cursor-wait",
            isDark ? "bg-violet-600" : "bg-slate-200",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className={[
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
              isDark ? "left-0.5 translate-x-5" : "left-0.5 translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>

      {/* ── Time zone ── */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <label htmlFor="settings-timezone" className="font-medium text-slate-700">
          Time zone
        </label>
        <select
          id="settings-timezone"
          defaultValue="UTC"
          className="h-9 w-56 rounded border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-violet-500"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time — New York</option>
          <option value="America/Chicago">Central Time — Chicago</option>
          <option value="America/Denver">Mountain Time — Denver</option>
          <option value="America/Los_Angeles">Pacific Time — Los Angeles</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Kolkata">India Standard Time</option>
          <option value="Asia/Tokyo">Japan Standard Time</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>
    </div>
  );
}
