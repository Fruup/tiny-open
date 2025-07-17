use std::fs;

use tauri::{Emitter, Listener, Manager};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_available_applications() -> Result<Vec<String>, ()> {
    let dir = fs::read_dir("/Applications").unwrap();
    let entries = dir
        .filter_map(|result| {
            let item = result.unwrap();

            match item.file_name().to_str() {
                Some(file_name) => {
                    // Filter out hidden items
                    if file_name.starts_with(".") {
                        return None;
                    }
                }
                _ => {}
            };

            item.path().to_str().map(|path| path.to_string())
        })
        .collect();

    Ok(entries)
}

#[tauri::command]
fn open_settings_window(app_handle: tauri::AppHandle) {
    let window_label = "settings";

    // Open existing settings window
    if let Some(window) = app_handle.get_webview_window(window_label) {
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        // open new window otherwise
        let window = tauri::WebviewWindowBuilder::from_config(
            &app_handle,
            app_handle
                .config()
                .app
                .windows
                .iter()
                .find(|it| it.label == window_label)
                .unwrap(),
        )
        .unwrap()
        .build()
        .unwrap();

        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stderr,
                ))
                .build(),
        )
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::AppleScript,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_available_applications,
            open_settings_window
        ])
        .setup(|app| {
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            app.handle().autolaunch().enable()?;

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        match event {
            // This replaces single-instance on macOS
            tauri::RunEvent::Reopen {
                has_visible_windows,
                ..
            } => {
                if has_visible_windows {
                    return;
                }

                let app_handle = app_handle.clone();
                open_settings_window(app_handle);
            }
            _ => {}
        }
    });
}
