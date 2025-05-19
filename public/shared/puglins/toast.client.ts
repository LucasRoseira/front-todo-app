

import Toast from "../components/ui/Toast.vue";

export default defineNuxtPlugin(
  (nuxtApp: {
    hook: (arg0: string, arg1: () => void) => void;
    provide: (arg0: string, arg1: any) => void;
  }) => {
    let toastInstance: any;

    nuxtApp.hook("app:mounted", () => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      const app = createApp(Toast);
      toastInstance = app.mount(container);

      nuxtApp.provide("toast", toastInstance);
    });
  }
);
