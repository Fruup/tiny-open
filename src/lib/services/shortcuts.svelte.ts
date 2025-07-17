import { tryCatch } from "$lib/helpers";
import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { openPath } from "@tauri-apps/plugin-opener";
import type { Shortcut } from "$lib/types";
import { useDebounce } from "runed";
import { Store } from "@tauri-apps/plugin-store";
import { log } from "./log";
import { emitTo, listen } from "@tauri-apps/api/event";

export class ShortcutsService {
  #current = $state<Shortcut[]>([]);
  #store: Store;
  #shortcutsDisabled = $state(false);

  static readonly STORAGE_NAME = "shortcuts.json";
  static readonly STORAGE_KEY = "value";

  #debouncedStore = useDebounce(() => {
    if (this.type !== "main") return;

    this.#store.set(ShortcutsService.STORAGE_KEY, this.#current);

    this.#reset();
  }, 1000);

  private constructor(
    readonly type: "main" | "sub",
    store: Store,
    value: Shortcut[],
  ) {
    this.#store = store;
    this.#current = value;
  }

  /**
   * Creates the global singleton instance `shortcutsService`.
   */
  static async create(type: "main" | "sub") {
    const store = await Store.load(ShortcutsService.STORAGE_NAME, {
      autoSave: true,
    });

    const stored = await store.get<Shortcut[]>(ShortcutsService.STORAGE_KEY);

    shortcutsService = new ShortcutsService(type, store, stored ?? []);

    if (type === "main") {
      await shortcutsService.#reset();
      await shortcutsService.#listen();
    }
  }

  private static emit<TMethod extends Methods<ShortcutsService>>(
    method: TMethod,
    ...args: Parameters<ShortcutsService[TMethod]>
  ) {
    emitTo("main", "shortcut", {
      method,
      args,
    });
  }

  get shortcuts() {
    return this.#current;
  }

  set shortcuts(value: Shortcut[]) {
    this.#current = value;

    if (this.type === "main") {
      this.#debouncedStore();
    } else {
      ShortcutsService.emit("setShortcuts", value);
    }
  }

  async #reset() {
    await unregisterAll().catch(log.error);

    await Promise.all(
      this.#current.map(async ({ shortcut, application }) => {
        if (this.#shortcutsDisabled) return;
        if (!shortcut) return;
        if (!application) return;

        const [_, error] = await tryCatch(
          register(shortcut, async ({ state }) => {
            if (state === "Released") return;

            const [_, error] = await tryCatch(openPath(application));

            if (error) {
              log.error(`Failed to open application '${application}'`, error);
            }
          }),
        );

        if (error) {
          log.error(`Failed to register shortcut '${shortcut}': ${error}`);
        } else {
          log.debug(`Registered shortcut '${shortcut}' for '${application}'`);
        }
      }),
    );
  }

  enable() {
    this.#shortcutsDisabled = false;

    if (this.type !== "main") {
      ShortcutsService.emit("enable");
    }
  }

  disable() {
    this.#shortcutsDisabled = true;

    if (this.type !== "main") {
      ShortcutsService.emit("disable");
    }
  }

  async #listen() {
    await listen("shortcut", async (e) => {
      const payload = e.payload as {
        method: keyof typeof ShortcutsService;
        args?: any[];
      };

      try {
        // @ts-ignore
        await this[payload.method]?.(...payload.args);
      } catch {}
    });
  }

  setShortcuts(value: Shortcut[]) {
    this.shortcuts = value;
  }
}

type ValuesOf<T> = T[keyof T];

type Methods<T> = ValuesOf<{
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}>;

export let shortcutsService: ShortcutsService;
