import { useState, useEffect } from "react";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

function useThemeSync(setTheme: (theme: "light" | "dark") => void) {
    useEffect(() => {
        function onThemeChange(e: CustomEvent<{ theme: "light" | "dark" }>) {
            setTheme(e.detail.theme);
        }
        document.addEventListener("themechange", onThemeChange as EventListener);
        return () => document.removeEventListener("themechange", onThemeChange as EventListener);
    }, [setTheme]);
}

export function ThemeToggle() {
    const [isClient, setIsClient] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        setIsClient(true);
        const currentTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
        setTheme(currentTheme);
    }, []);

    useThemeSync(setTheme);

    // TODO: Animate toggle button for extra flair
    const handleThemeToggle = () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(nextTheme);
        localStorage.setItem("theme", nextTheme);
        localStorage.setItem("manualOverride", "true");
        setTheme(nextTheme);
        // console.log("Theme toggled to", nextTheme);
        document.dispatchEvent(
            new CustomEvent("themechange", { detail: { theme: nextTheme } })
        );
    };

    if (!isClient) {
        return <div style={{ width: 40, height: 40 }} />;
    }

    return (
        <button
            onClick={handleThemeToggle}
            className="theme-toggle-btn fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center z-10"
            aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
            {theme === 'dark' ? (
                <LightModeIcon fontSize="small" />
            ) : (
                <DarkModeIcon fontSize="small" />
            )}
        </button>
    );
}