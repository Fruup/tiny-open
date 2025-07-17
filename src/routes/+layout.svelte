<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:boundary>
  {#snippet pending()}{/snippet}

  {@render children()}
</svelte:boundary>
