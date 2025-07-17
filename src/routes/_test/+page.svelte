<script lang="ts">
  import HotkeyInput from "../(app)/settings/HotkeyInput.svelte";

  let value = $state("");
</script>

<div class="h-screen grid place-content-center">
  <HotkeyInput bind:value></HotkeyInput>
</div>
