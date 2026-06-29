import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div>
      <App />

      <div className="toaster-container">
        <div className="toaster-notifications">
          <Toaster
            position="top-center"
            offset={100}
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: "min-h-[60px] w-auto flex flex-1 text-lg", 
                title: "text-[16px] font-bold",
                description: "text-base", 
              },
            }}
          />
        </div>
      </div>
    </div>
  </StrictMode>,
);
