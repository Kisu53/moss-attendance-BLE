import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.scss";
import App from "./App.tsx";

async function enableMocking() {
  const shouldEnableMocking = import.meta.env.DEV
    ? import.meta.env.VITE_API_MOCKING !== "false"
    : import.meta.env.VITE_API_MOCKING === "true";

  if (!shouldEnableMocking) {
    return;
  }

  const { worker } = await import("./mock/browser");

  return worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
    onUnhandledRequest: "bypass",
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </StrictMode>
  );
});
