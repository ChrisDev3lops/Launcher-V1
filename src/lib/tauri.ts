import { invoke } from '@tauri-apps/api/core'

export interface FortniteFolderResult {
  folder: string
  exePath: string | null
}

export interface LaunchGameResult {
  success: boolean
  error?: string
}

export const tauriAPI = {
  minimize: () => invoke<void>('minimize_window'),
  maximize: () => invoke<void>('maximize_window'),
  close: () => invoke<void>('close_window'),
  selectFortniteFolder: () => invoke<FortniteFolderResult | null>('select_fortnite_folder'),
  launchGame: (opts: { exePath: string; dllPath?: string; backendUrl?: string }) =>
    invoke<LaunchGameResult>('launch_game', {
      exePath: opts.exePath,
      dllPath: opts.dllPath,
      backendUrl: opts.backendUrl,
    }),
}
