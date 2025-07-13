<script lang="ts">
  import { resetShortcuts } from "$lib/services/shortcuts.svelte";
  import { wrapStoreValue } from "./settings/helpers.svelte";
  import type { Shortcut } from "./settings/types";

  let { data } = $props();
  const { appStore } = data;

  const shortcutsStore = wrapStoreValue<Shortcut[]>(appStore, "shortcuts", []);

  $effect(() => {
    if (shortcutsStore.loading) return;
    resetShortcuts(shortcutsStore.current);
  });
</script>
