use tauri::Manager;
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_opener::OpenerExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn open_settings_window(app_handle: &tauri::AppHandle) {
    let window_label = "settings";

    // Open existing settings window
    if let Some(window) = app_handle.get_webview_window(window_label) {
        let _ = window.show();
        let _ = window.set_focus();
    } else {
        // open new window otherwise
        let window = tauri::WebviewWindowBuilder::from_config(
            app_handle,
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
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::AppleScript,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            use tauri_plugin_global_shortcut::{
                Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
            };

            // TODO: load these from the store
            let shortcut_zen = Shortcut::new(Some(Modifiers::CONTROL), Code::Digit0);
            let shortcut_code = Shortcut::new(Some(Modifiers::CONTROL), Code::Digit9);

            app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |app_handle, shortcut, event| {
                        if event.state != ShortcutState::Pressed {
                            return;
                        }
                        let path = {
                            if shortcut == &shortcut_code {
                                "/Applications/Visual Studio Code.app"
                            } else if shortcut == &shortcut_zen {
                                "/Applications/zen.app"
                            } else {
                                return;
                            }
                        }
                        .to_string();
                        let _ = app_handle.opener().open_path(path, None::<String>);
                    })
                    .build(),
            )?;

            app.handle().global_shortcut().register(shortcut_zen)?;
            app.handle().global_shortcut().register(shortcut_code)?;

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

                // let app_handle = app_handle.clone();
                open_settings_window(&app_handle);
            }
            _ => {}
        }
    });
}
