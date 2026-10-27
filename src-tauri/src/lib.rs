use std::path::{Path, PathBuf};
use std::process::Stdio;
use tauri::{command, AppHandle, Window};

const DLL_URL: &str = "https://raw.githubusercontent.com/ChrisDev3lops/launcher-redirectblah/refs/heads/main/Tellurium.dll";
const DLL_FILENAME: &str = "GFSDK_Aftermath_Lib.x64.dll";
const BACKEND_URL: &str = "http://127.0.0.1:3551";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      minimize_window,
      maximize_window,
      close_window,
      select_fortnite_folder,
      launch_game,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[command]
fn minimize_window(window: Window) -> Result<(), String> {
  window.minimize().map_err(|e| e.to_string())
}

#[command]
fn maximize_window(window: Window) -> Result<(), String> {
  if window.is_maximized().map_err(|e| e.to_string())? {
    window.unmaximize().map_err(|e| e.to_string())
  } else {
    window.maximize().map_err(|e| e.to_string())
  }
}

#[command]
fn close_window(window: Window) -> Result<(), String> {
  window.close().map_err(|e| e.to_string())
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct FortniteFolderResult {
  folder: String,
  exe_path: Option<String>,
}

#[command]
async fn select_fortnite_folder(app: AppHandle) -> Result<Option<FortniteFolderResult>, String> {
  use tauri_plugin_dialog::DialogExt;
  let Some(folder) = app.dialog().file().blocking_pick_folder() else {
    return Ok(None);
  };
  let folder = folder.into_path().map_err(|e| e.to_string())?;
  let folder_str = folder.to_string_lossy().to_string();
  let exe_path = find_fortnite_exe(&folder, 0)
    .map(|p| p.to_string_lossy().to_string());
  Ok(Some(FortniteFolderResult { folder: folder_str, exe_path }))
}

fn find_fortnite_exe(dir: &Path, depth: usize) -> Option<PathBuf> {
  if depth > 4 {
    return None;
  }
  let entries = std::fs::read_dir(dir).ok()?;
  for entry in entries.flatten() {
    let path = entry.path();
    if path.is_file() && path.file_name().and_then(|n| n.to_str()) == Some("FortniteClient-Win64-Shipping.exe") {
      return Some(path);
    }
  }
  let entries = std::fs::read_dir(dir).ok()?;
  for entry in entries.flatten() {
    let path = entry.path();
    if path.is_dir() {
      if let Some(found) = find_fortnite_exe(&path, depth + 1) {
        return Some(found);
      }
    }
  }
  None
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct LaunchGameArgs {
  exe_path: String,
  #[serde(default)]
  dll_path: Option<String>,
  #[serde(default)]
  backend_url: Option<String>,
}

#[derive(serde::Serialize)]
struct LaunchGameResult {
  success: bool,
  #[serde(skip_serializing_if = "Option::is_none")]
  error: Option<String>,
}

#[command]
async fn launch_game(args: LaunchGameArgs) -> Result<LaunchGameResult, String> {
  let _ = args.dll_path;
  let exe_path = PathBuf::from(&args.exe_path);
  if !exe_path.exists() {
    return Ok(LaunchGameResult {
      success: false,
      error: Some(format!("Executable not found: {}", args.exe_path)),
    });
  }

  let exe_dir = exe_path.parent().ok_or("Invalid executable path")?;
  let game_root = exe_dir
    .parent()
    .and_then(|p| p.parent())
    .and_then(|p| p.parent())
    .ok_or("Could not resolve game root")?;
  let dll_dir = game_root
    .join("Engine")
    .join("Binaries")
    .join("ThirdParty")
    .join("NVIDIA")
    .join("NVaftermath")
    .join("Win64");
  tokio::fs::create_dir_all(&dll_dir).await.map_err(|e| e.to_string())?;
  let dll_dest = dll_dir.join(DLL_FILENAME);

  if dll_dest.exists() {
    let mut removed = false;
    for _ in 0..20 {
      if tokio::fs::remove_file(&dll_dest).await.is_ok() {
        removed = true;
        break;
      }
      tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    }
    if !removed {
      return Ok(LaunchGameResult {
        success: false,
        error: Some("Could not remove existing DLL — is the game already running?".into()),
      });
    }
  }

  if let Err(err) = download_dll(DLL_URL, &dll_dest).await {
    return Ok(LaunchGameResult {
      success: false,
      error: Some(err.to_string()),
    });
  }

  if !dll_dest.exists() {
    return Ok(LaunchGameResult {
      success: false,
      error: Some("DLL not found after download".into()),
    });
  }

  let _ = tokio::process::Command::new("taskkill")
    .args(["/F", "/IM", "EpicGamesLauncher.exe"])
    .stdout(Stdio::null())
    .stderr(Stdio::null())
    .spawn();
  let _ = tokio::process::Command::new("taskkill")
    .args(["/F", "/IM", "EpicWebHelper.exe"])
    .stdout(Stdio::null())
    .stderr(Stdio::null())
    .spawn();

  tokio::time::sleep(std::time::Duration::from_millis(600)).await;

  let backend = args.backend_url.unwrap_or_else(|| BACKEND_URL.to_string());

  let mut cmd = tokio::process::Command::new(&exe_path);
  cmd.args([
    "-epicapp=Fortnite",
    "-epicenv=Prod",
    "-epiclocale=en-us",
    "-epicportal",
    "-noeac",
    "-nobe",
    "-fromfl=eac",
    "-fltoken=none",
    "-skippatchcheck",
    "-AUTH_LOGIN=unused",
    "-AUTH_PASSWORD=unused",
    "-AUTH_TYPE=exchangecode",
  ])
  .arg(format!("-ironmp_BACKEND={}", backend))
  .current_dir(exe_dir)
  .stdin(Stdio::null())
  .stdout(Stdio::null())
  .stderr(Stdio::null())
  .env_remove("EPIC_GAMES_LAUNCHER_LOCATION")
  .env_remove("EPIC_DISPLAY_NAME");

  #[cfg(windows)]
  cmd.creation_flags(0x00000008);

  let _ = cmd.spawn().map_err(|e| e.to_string())?;

  Ok(LaunchGameResult { success: true, error: None })
}

async fn download_dll(url: &str, dest: &Path) -> Result<(), Box<dyn std::error::Error>> {
  let response = reqwest::get(url).await?;
  if !response.status().is_success() {
    return Err(format!("DLL download failed: HTTP {}", response.status()).into());
  }
  let bytes = response.bytes().await?;
  tokio::fs::write(dest, bytes).await?;
  Ok(())
}
