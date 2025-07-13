import { Store } from "@tauri-apps/plugin-store";

export const prerender = true;
export const ssr = false;

export const load = async () => {
  const appStore = await Store.load("app.json", { autoSave: 100 });

  return {
    appStore,
  };
};
