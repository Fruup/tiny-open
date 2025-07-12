<script lang="ts">
  import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
  import { openPath } from "@tauri-apps/plugin-opener";
  import { tryCatch } from "$lib/helpers";
  import ShortcutsInput from "./ShortcutsInput.svelte";
  import { wrapStoreValue } from "./helpers.svelte";
  import type { Shortcut } from "./types";
  import { useDebounce } from "runed";

  let { data } = $props();
  const { appStore } = data;

  const shortcutsStore = wrapStoreValue<Shortcut[]>(appStore, "shortcuts", []);

  const resetShortcutsDebounced = useDebounce(() => {
    resetShortcuts();
  }, 1000);

  $effect(() => {
    if (!shortcutsStore.loading) resetShortcutsDebounced.runScheduledNow();
  });

  const resetShortcuts = async () => {
    await unregisterAll();

    await Promise.all(
      shortcutsStore.current.map(async ({ shortcut, application }) => {
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
</script>

<main class="container min-h-screen p-8 grid place-content-center">
  <h1 class="text-2xl mb-4">Shortcuts</h1>

  {#if !shortcutsStore.loading}
    <ShortcutsInput
      bind:value={shortcutsStore.current}
      onChange={() => resetShortcuts()}
    />
  {/if}
</main>
