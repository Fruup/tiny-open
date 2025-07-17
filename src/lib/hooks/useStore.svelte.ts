import { Store } from "@tauri-apps/plugin-store";

export const useStore = async <T>(
  storeOrPath: Store | string,
  key: string,
  fallback: () => T,
  options: {
    onChange?: (value: T) => void;
    onChangeReceived?: (value: T) => void;
  } = {},
) => {
  const store =
    typeof storeOrPath === "string"
      ? await Store.load(storeOrPath, { autoSave: false })
      : storeOrPath;

  let _current = $state<T>((await store.get(key)) ?? fallback());

  store.onKeyChange<T>(key, (value) => {
    if (value === undefined) return;

    _current = value;

    options.onChangeReceived?.(value);
  });

  return {
    get current() {
      return _current;
    },
    set current(value) {
      _current = value;

      options.onChange?.(value);
      store.set(key, value);

      // TODO: save
    },
  };
};

export type MyStore<T> = Awaited<ReturnType<typeof useStore<T>>>;
