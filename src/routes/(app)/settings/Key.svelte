<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<div
  class="rounded-xl box-content font-mono border grid place-content-center min-h-10 min-w-10 border-b-4"
>
  {@render children()}
</div>
