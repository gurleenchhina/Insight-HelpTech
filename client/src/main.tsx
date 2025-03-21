import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set document title
document.title = "PestPro Advisor";

// Add Material Icons link
const linkElement = document.createElement('link');
linkElement.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
linkElement.rel = "stylesheet";
document.head.appendChild(linkElement);

// Add Google Fonts
const fontLink = document.createElement('link');
fontLink.href = "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Condensed:wght@400;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(<App />);
