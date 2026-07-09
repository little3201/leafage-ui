import { defineBoot } from "#q-app";
import { handlers } from "@/mocks";
import { setupWorker } from "msw/browser";

export default defineBoot(async () => {
  // dev
  if (import.meta.env.DEV) {
    const worker = setupWorker(...handlers);
    await worker.start({
      onUnhandledRequest: "bypass"
    });
  }
});
