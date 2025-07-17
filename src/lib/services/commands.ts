import { tryCatch } from "$lib/helpers";
import { invoke } from "@tauri-apps/api/core";

export const getAvailableApplications = () =>
  tryCatch(invoke<string[]>("get_available_applications"));

export const openSettingsWindow = () =>
  tryCatch(invoke("open_settings_window"));
