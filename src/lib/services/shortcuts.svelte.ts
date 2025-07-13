import { tryCatch } from "$lib/helpers";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { openPath } from "@tauri-apps/plugin-opener";
import type { Shortcut } from "../../routes/settings/types";

export const resetShortcuts = async (shortcuts: Shortcut[]) => {
  await unregisterAll();

  await Promise.all(
    shortcuts.map(async ({ shortcut, application }) => {
      if (!shortcut) return;
      if (!application) return;

      const [_, error] = await tryCatch(
        register(shortcut, async ({ state }) => {
          if (state === "Released") return;

          const [_, error] = await tryCatch(openPath(application));

          if (error) {
            console.error(`Failed to open application '${application}'`, error);
          }
        }),
      );

      if (error) {
        console.error(`Failed to register shortcut '${shortcut}'`, error);
      } else {
        console.log(`Registered shortcut '${shortcut}' for '${application}'`);
      }
    }),
  );
};
