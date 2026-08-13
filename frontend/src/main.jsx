import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./landing.css";
import "./app.css";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>
);
