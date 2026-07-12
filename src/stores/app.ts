import { acceptHMRUpdate, defineStore } from "pinia";
import Cookies from "js-cookie";

export const useAppStore = defineStore("app", {
  state: (): { locale: string } => ({
    locale: Cookies.get("lang") || "zh-CN"
  }),
  actions: {
    setLocale(locale: string) {
      this.locale = locale;
      Cookies.set("lang", locale, { secure: true, sameSite: "Lax" });
      // 修改html中lang
      const htmlElement = document.querySelector("html");

      if (htmlElement) {
        htmlElement.setAttribute("lang", locale);
      }
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
}
