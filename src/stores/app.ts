import { acceptHMRUpdate, defineStore } from "pinia";
import { Cookies } from "quasar";

export const useAppStore = defineStore("app", {
  state: (): { locale: string; theme: string } => ({
    locale: Cookies.get("lang") || "zh-CN",
    theme: Cookies.get("theme") || "light"
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
    },

    setTheme(theme: string) {
      this.theme = theme;
      Cookies.set("theme", theme, { secure: true, sameSite: "Lax" });
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
}
