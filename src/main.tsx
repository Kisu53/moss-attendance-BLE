import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

async function enableMocking() {
    // npm run dev => true, npm run build => false로 런타임에서 동작 차단
    if (!import.meta.env.DEV || import.meta.env.VITE_API_MOCKING === "false") {
        return;
    }

    //프로덕션 빌드에 포함되지 않게 하기위해 동적 import
    const { worker } = await import("./mock/browser");

    return worker.start({
        onUnhandledRequest: "bypass",
    });
}

enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
});
