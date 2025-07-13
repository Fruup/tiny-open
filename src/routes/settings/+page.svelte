<script lang="ts">
  import ShortcutsInput from "./ShortcutsInput.svelte";
  import { useDebounce } from "runed";
  import { resetShortcuts } from "$lib/services/shortcuts.svelte";
  import { wrapStoreValue } from "./helpers.svelte";
  import type { Shortcut } from "./types";

  let { data } = $props();
  const { appStore } = data;

  const shortcutsStore = wrapStoreValue<Shortcut[]>(appStore, "shortcuts", []);

  const resetShortcutsDebounced = useDebounce(() => {
    resetShortcuts(shortcutsStore.current);
  }, 1000);
</script>

<main class="container min-h-screen p-8 grid place-content-center">
  <h1 class="text-2xl mb-4">Shortcuts</h1>

  {#if !shortcutsStore.loading}
    <ShortcutsInput
      bind:value={shortcutsStore.current}
      onChange={() => resetShortcutsDebounced()}
    />
  {/if}
</main>
