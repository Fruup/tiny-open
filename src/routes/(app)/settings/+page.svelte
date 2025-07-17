<script lang="ts">
  import ShortcutsInput from "./ShortcutsInput.svelte";
  import { shortcutsService } from "$lib/services/shortcuts.svelte";
  import { getAvailableApplications } from "$lib/services/commands";

  const availableApplications = getAvailableApplications();
</script>

<main class="container min-h-screen p-8 grid place-content-center">
  <h1 class="text-2xl mb-4">Shortcuts</h1>

  {#await availableApplications then [availableApplications, error]}
    {#if error}
      ERROR
    {:else}
      <ShortcutsInput
        bind:value={shortcutsService.shortcuts}
        {availableApplications}
      />
    {/if}
  {/await}
</main>
