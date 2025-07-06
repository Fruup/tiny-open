<script lang="ts">
  import { useDebounce } from "runed";

  let {
    value = $bindable([]),
    onChange: onChange_,
  }: {
    value: Shortcut[];
    onChange?: (value: Shortcut[]) => void;
  } = $props();

  interface Shortcut {
    shortcut: string;
    application: string;
  }

  const onChange = useDebounce(() => {
    onChange_?.(value);
  }, 1000);
</script>

<div class="flex gap-2 flex-col">
  {#each value as { application, shortcut }, i}
    <div class="p-1 rounded-lg border">
      <input
        type="text"
        placeholder="Shortcut"
        bind:value={
          () => shortcut,
          (v) => {
            value[i].shortcut = v;

            onChange();
          }
        }
      />

      <input
        type="text"
        placeholder="Application"
        bind:value={
          () => application,
          (v) => {
            value[i].application = v;

            onChange();
          }
        }
      />
    </div>
  {/each}

  <button
    type="button"
    onclick={() =>
      value.push({
        shortcut: "",
        application: "",
      })}
  >
    +
  </button>
</div>
