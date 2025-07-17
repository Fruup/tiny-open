<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import {
    CommandIcon,
    OptionIcon,
    ArrowBigUpIcon,
    ChevronUpIcon,
  } from "lucide-svelte";
  import Key from "./Key.svelte";
  import { onDestroy } from "svelte";
  import { shortcutsService } from "$lib/services/shortcuts.svelte";

  let {
    value = $bindable(null),
  }: {
    value: string | null;
  } = $props();

  const MODIFIERS = ["Meta", "Control", "Shift", "Alt"] as const;
  type Modifier = (typeof MODIFIERS)[number];
  const isModifier = (key: string): key is Modifier =>
    MODIFIERS.includes(key as any);

  let modifiers = new SvelteSet<Modifier>();
  let keys = new SvelteSet<string>();

  let inputRef = $state<HTMLInputElement>();

  const handleChange = () => {
    value = [...modifiers, ...keys].join("+");
  };

  const isValid = () => {
    return modifiers.size > 0 && keys.size > 0;
  };

  const handleCancel = () => {
    inputRef?.blur();

    modifiers.clear();
    keys.clear();

    value = null;

    console.log("*** Cancelled input");
  };

  const handleSubmit = () => {
    if (!isValid()) return handleCancel();

    inputRef?.blur();

    handleChange();
    console.log("*** Submitting:", value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.repeat) return;

    if (e.key === "Escape") {
      handleCancel();
      return;
    } else if (e.key === "Enter") {
      handleSubmit();
      return;
    } else if (isModifier(e.key)) {
      modifiers.add(e.key);
    } else {
      keys.add(e.key);
    }
  };

  $inspect(modifiers, keys);

  const handleKeyUp = (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (isModifier(e.key)) {
      modifiers.delete(e.key);
    } else {
      keys.delete(e.key);
    }
  };

  onDestroy(() => {
    shortcutsService.enable();
  });
</script>

<div
  class="relative rounded-xl p-3 min-h-10 box-content min-w-[100px] border focus-within:outline-1 outline-primary outline-offset-2 focus-within:shadow transition-all"
>
  <input
    class="absolute inset-0 opacity-0"
    bind:this={inputRef}
    type="text"
    onkeydown={handleKeyDown}
    onkeyup={handleKeyUp}
    onfocus={() => {
      shortcutsService.disable();
      modifiers.clear();
      keys.clear();
    }}
    onblur={() => {
      shortcutsService.enable();
    }}
  />

  <div class="flex gap-2 items-center">
    {#each modifiers as modifier}
      <Key>
        {#if modifier === "Meta"}
          <CommandIcon size="1em" />
        {:else if modifier === "Alt"}
          <OptionIcon size="1em" />
        {:else if modifier === "Shift"}
          <ArrowBigUpIcon size="1em" />
        {:else if modifier === "Control"}
          <ChevronUpIcon size="1em" />
        {:else}
          {modifier}
        {/if}
      </Key>
    {/each}

    {#if keys.size > 0 && modifiers.size > 0}
      <span>+</span>
    {/if}

    {#each keys as key}
      <Key>{key.toUpperCase()}</Key>
    {/each}
  </div>
</div>
