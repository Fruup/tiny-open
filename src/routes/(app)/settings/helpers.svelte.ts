import type { Store } from "@tauri-apps/plugin-store";

export const wrapStoreValue = <T>(store: Store, key: string, fallback: T) => {
  let _loading = $state(true);
  let _current = $state<T>(fallback);

  store
    .get<T>(key)
    .then((value) => {
      console.log(`Loaded value for key "${key}":`, value);
      _current = value ?? fallback;
    })
    .finally(() => {
      _loading = false;
    });

  return {
    get current() {
      return _current;
    },
    set current(value: T) {
      if (_loading) return;

      _current = value;

      // TODO: prevent race conditions
      store.set(key, value).catch(console.error);
    },
    get loading() {
      return _loading;
    },
  };
};
