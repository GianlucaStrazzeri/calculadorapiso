import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

// Register service worker for PWA (only if supported)
// Register service worker for PWA only in production builds.
// During development a service worker can cache the dev client/html and
// cause the browser to try connecting to an old Vite port (5173), producing
// the WebSocket/HMR errors you see. Register SW only when Vite is running
// the production build (import.meta.env.PROD === true).
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('Service worker registered.', reg))
      .catch((err) => console.warn('Service worker registration failed:', err));
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
