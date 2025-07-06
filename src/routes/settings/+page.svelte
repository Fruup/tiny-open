<script lang="ts">
  import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
  import { openPath } from "@tauri-apps/plugin-opener";
  import { onMount } from "svelte";
  import { tryCatch } from "$lib/helpers";
  import ShortcutsInput from "./ShortcutsInput.svelte";

  interface Shortcut {
    shortcut: string;
    application: string;
  }

  const resetShortcuts = async () => {
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
              console.error(
                `Failed to open application '${application}'`,
                error,
              );
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

  // TODO: use store
  let shortcuts = $state<Shortcut[]>(
    // JSON.parse(localStorage.getItem("shortcuts") || "[]")
    [
      {
        shortcut: "Control+0",
        application: "/Applications/zen.app",
      },
      {
        shortcut: "Control+9",
        application: "/Applications/Visual Studio Code.app",
      },
    ],
  );

  onMount(() => {
    resetShortcuts();
  });
</script>

<main class="container">
  <h1>Shortcuts</h1>

  <ShortcutsInput bind:value={shortcuts} onChange={() => resetShortcuts()} />
</main>
