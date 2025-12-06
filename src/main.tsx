import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme before React renders to prevent flash of unstyled content
const storedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const theme = storedTheme || (prefersDark ? "dark" : "light");
document.documentElement.classList.add(theme);

createRoot(document.getElementById("root")!).render(<App />);
