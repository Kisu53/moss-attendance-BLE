// 브라우저에서 MSW를 시작하도록 하는 설정

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
