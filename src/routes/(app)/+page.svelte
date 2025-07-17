<script lang="ts">
  import { TrayIcon } from "@tauri-apps/api/tray";
  import * as log from "@tauri-apps/plugin-log";
  import iconUrl from "../../../src-tauri/icons/icon.png?url";
  import { openSettingsWindow } from "$lib/services/commands";
  import { Menu, MenuItem } from "@tauri-apps/api/menu";

  const TRAY_ID = "my-tray-icon";

  const loadTrayIcon = async () => {
    const menu = await Menu.new({
      items: [
        await MenuItem.new({
          text: "Settings",
          accelerator: "CmdOrCtrl+,",
          action() {
            openSettingsWindow();
          },
        }),
      ],
    });

    const trayIcon = await TrayIcon.new({
      id: TRAY_ID,
      menu,
      showMenuOnLeftClick: true,
      icon: await fetch(iconUrl).then((response) => response.arrayBuffer()),
      iconAsTemplate: true,
    }).catch(log.error);

    return async () => {
      await menu?.close();

      await trayIcon?.close();
      await TrayIcon.removeById(TRAY_ID);
    };
  };

  $effect(() => {
    let cleanup: () => any;

    loadTrayIcon().then((cleanup_) => {
      cleanup = cleanup_;
    });

    return () => {
      cleanup();
    };
  });
</script>
