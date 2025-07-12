<script lang="ts">
  import { useDebounce } from "runed";

  let {
    value = $bindable(),
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
    <div class="p-2 font-mono rounded-lg border">
      <input
        type="text"
        placeholder="Shortcut"
        bind:value={
          () => shortcut,
          (v) => {
            value[i].shortcut = v;

            // for some reason this is necessary...
            value = value;

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

            // for some reason this is necessary...
            value = value;

            onChange();
          }
        }
      />
    </div>
  {/each}

  <button
    type="button"
    class="hover:bg-muted-foreground"
    onclick={() =>
      value.push({
        shortcut: "",
        application: "",
      })}
  >
    +
  </button>
</div>
