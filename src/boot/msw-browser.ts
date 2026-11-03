// msw-browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "@/mocks";

export function enableMock() {
  const worker = setupWorker(...handlers);

  return worker.start({
    onUnhandledRequest: "bypass"
  });
}
