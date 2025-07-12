<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:boundary onerror={console.error}>
  {@render children()}

  {#snippet pending()}
    loading...
  {/snippet}

  {#snippet failed(error, reset)}
    ERROR: {error}
  {/snippet}
</svelte:boundary>
