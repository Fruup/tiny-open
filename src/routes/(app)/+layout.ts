import { ShortcutsService } from "$lib/services/shortcuts.svelte";
import { webviewWindow } from "@tauri-apps/api";

export const load = async () => {
  const isMain = webviewWindow.getCurrentWebviewWindow().label === "main";

  await ShortcutsService.create(isMain ? "main" : "sub");
};
