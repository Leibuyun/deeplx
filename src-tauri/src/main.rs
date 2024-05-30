// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use api::TranslateResp;
use ctrlc;
use lang::Language;
use tauri::{
  api::process::{Command, CommandChild, CommandEvent},
  Manager,
};
mod api;
mod lang;

fn clear_process(child: &mut Option<CommandChild>) {
  if let Some(child) = child.take() {
    child.kill().unwrap();
    println!("Deeplx child process killed");
  }
}

#[tauri::command]
async fn translate_lang(text: String, source_lang: Language, target_lang: Language) -> Result<TranslateResp, String> {
  println!("Translating: {} from {} to {}", text, source_lang, target_lang);
  let resp = api::translate(text, source_lang, target_lang).await;
  match resp {
    Ok(resp) => {
      println!("resp: {:?}", resp);
      Ok(resp)
    }
    Err(e) => {
      println!("error: {:?}", e.to_string());
      Err(e.to_string())
    }
  }
}

#[tokio::main]
async fn main() {
  let (mut rx, child) = Command::new_sidecar("translator")
    .expect("failed to create `translator` binary command")
    .spawn()
    .expect("Failed to spawn translator");
  let deeplx_child = Arc::new(Mutex::new(Some(child)));
  let clone_deeplx = Arc::clone(&deeplx_child);
  let clone_deeplx2 = Arc::clone(&deeplx_child);
  tauri::async_runtime::spawn(async move {
    while let Some(event) = rx.recv().await {
      if let CommandEvent::Stdout(line) = event {
        println!("deeplx: {}", line);
      }
    }
  });
  ctrlc::set_handler(move || {
    let mut child = deeplx_child.lock().unwrap();
    clear_process(&mut child);
    std::process::exit(0);
  })
  .unwrap();
  tauri::Builder::default()
    .plugin(tauri_plugin_single_instance::init(move |app, argv, cwd| {
      app.get_window("main").unwrap().set_focus().unwrap();
    }))
    .on_window_event(move |e| {
      if let tauri::WindowEvent::Destroyed = e.event() {
        let mut child = clone_deeplx2.lock().unwrap();
        clear_process(&mut child);
      }
    })
    .invoke_handler(tauri::generate_handler![translate_lang])
    .build(tauri::generate_context!())
    .expect("error while running tauri application")
    .run(move |app_handle, event| match event {
      tauri::RunEvent::Exit => {
        let mut child = clone_deeplx.lock().unwrap();
        clear_process(&mut child)
      }
      _ => {}
    });
}
