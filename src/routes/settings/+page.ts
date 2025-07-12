import { Store } from "@tauri-apps/plugin-store";

export const load = async () => {
  const appStore = await Store.load("app.json", { autoSave: 100 });

  console.log("ENTRIES", await appStore.entries());

  return {
    appStore,
  };
};
