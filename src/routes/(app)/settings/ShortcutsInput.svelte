<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";

  let {
    value = $bindable(),
    availableApplications: availableApplications_,
  }: {
    value: Shortcut[];
    availableApplications: string[];
  } = $props();

  interface Shortcut {
    shortcut: string;
    application: string;
  }

  const getApplicationLabel = (value: string) =>
    value.slice(value.lastIndexOf("/") + 1);

  const availableApplications = $derived(
    availableApplications_.map((value) => ({
      value,
      label: getApplicationLabel(value),
    })),
  );
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
          }
        }
      />

      <Select.Root
        type="single"
        bind:value={
          () => application,
          (v) => {
            value[i].application = v;

            // for some reason this is necessary...
            value = value;
          }
        }
      >
        <Select.Trigger>
          {application ? getApplicationLabel(application) : "Application..."}
        </Select.Trigger>

        <Select.Content>
          {#each availableApplications as { value, label }}
            <Select.Item {value}>
              {value.slice(value.lastIndexOf("/") + 1)}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
  {/each}

  <Button
    onclick={() =>
      value.push({
        shortcut: "",
        application: "",
      })}
  >
    +
  </Button>
</div>
