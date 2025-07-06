use tauri_plugin_opener::OpenerExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        // .setup(|app| {
        //     use tauri_plugin_global_shortcut::{
        //         Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
        //     };
        //     let shortcut_zen = Shortcut::new(Some(Modifiers::CONTROL), Code::Digit0);
        //     let shortcut_code = Shortcut::new(Some(Modifiers::CONTROL), Code::Digit9);
        //     app.handle().plugin(
        //         tauri_plugin_global_shortcut::Builder::new()
        //             .with_handler(move |app_handle, shortcut, event| {
        //                 if event.state != ShortcutState::Pressed {
        //                     return;
        //                 }
        //                 let path = {
        //                     if shortcut == &shortcut_code {
        //                         "/Applications/Visual Studio Code.app"
        //                     } else if shortcut == &shortcut_zen {
        //                         "/Applications/zen.app"
        //                     } else {
        //                         return;
        //                     }
        //                 }
        //                 .to_string();
        //                 let _ = app_handle.opener().open_path(path, None::<String>);
        //             })
        //             .build(),
        //     )?;
        //     app.handle().global_shortcut().register(shortcut_zen)?;
        //     app.handle().global_shortcut().register(shortcut_code)?;
        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
