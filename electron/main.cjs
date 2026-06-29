const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const https = require('https')
const http = require('http')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

const DLL_URL = 'https://raw.githubusercontent.com/ChrisDev3lops/launcher-redirectblah/refs/heads/main/Tellurium.dll'
const DLL_FILENAME = 'GFSDK_Aftermath_Lib.x64.dll'
const BACKEND_URL = 'http://127.0.0.1:3551'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f13',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
        webSecurity: false,
    },
    icon: path.join(__dirname, '../public/aaecc863-a686-4d4e-bd97-14dea0403af7.ico'),
  })

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
'Content-Security-Policy': [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:3551 http://26.87.221.115:* https://fortnite-api.com https://fonts.googleapis.com https://fonts.gstatic.com data: blob:;"
]
      }
    })
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    // win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
  ipcMain.on('window-minimize', () => win.minimize())
  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.on('window-close', () => win.close())
  ipcMain.handle('select-fortnite-folder', async () => {
    const result = await dialog.showOpenDialog(win, {
      title: 'Select Fortnite folder',
      properties: ['openDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) return null

    const folder = result.filePaths[0]
    const exeName = 'FortniteClient-Win64-Shipping.exe'
    function findExe(dir, depth = 0) {
      if (depth > 4) return null
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          if (!entry.isDirectory() && entry.name === exeName) {
            return path.join(dir, entry.name)
          }
        }
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const found = findExe(path.join(dir, entry.name), depth + 1)
            if (found) return found
          }
        }
      } catch { /* skip inaccessible dirs */ }
      return null
    }
    const exePath = findExe(folder)
    return { folder, exePath }
  })

  ipcMain.handle('download-dll', async (_event, { url, filename }) => {
    try {
      const dllDir = path.join(app.getPath('userData'), 'dlls')
      fs.mkdirSync(dllDir, { recursive: true })
      const dllPath = path.join(dllDir, filename || 'injector.dll')

      await new Promise((resolve, reject) => {
        function download(rawUrl) {
          const client = rawUrl.startsWith('https') ? https : http
          client.get(rawUrl, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
              return download(res.headers.location)
            }
            if (res.statusCode !== 200) {
              return reject(new Error(`HTTP ${res.statusCode}`))
            }
            const file = fs.createWriteStream(dllPath)
            res.pipe(file)
            file.on('finish', () => file.close(resolve))
            file.on('error', (err) => { fs.unlink(dllPath, () => {}); reject(err) })
          }).on('error', reject)
        }
        download(url)
      })

      return { success: true, dllPath }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('launch-game', async (_event, { exePath, backendUrl }) => {
    if (!exePath || !fs.existsSync(exePath)) {
      return { success: false, error: 'Executable not found: ' + exePath }
    }
    try {
      let dllPath = null
      try {
        const gameRoot = path.join(path.dirname(exePath), '..', '..', '..')
        const dllDir = path.join(gameRoot, 'Engine', 'Binaries', 'ThirdParty', 'NVIDIA', 'NVaftermath', 'Win64')
        fs.mkdirSync(dllDir, { recursive: true })
        const dllDest = path.join(dllDir, DLL_FILENAME)
        await new Promise((resolve, reject) => {
          function download(rawUrl) {
            const client = rawUrl.startsWith('https') ? https : http
            client.get(rawUrl, (res) => {
              if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
                return download(res.headers.location)
              }
              if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode}`))
              }
              const file = fs.createWriteStream(dllDest)
              res.pipe(file)
              file.on('finish', () => file.close(resolve))
              file.on('error', (err) => { fs.unlink(dllDest, () => {}); reject(err) })
            }).on('error', reject)
          }
          download(DLL_URL)
        })
        dllPath = dllDest
      } catch (dlErr) {
        console.error('DLL download failed:', dlErr)
      }
      try {
        spawn('taskkill', ['/F', '/IM', 'EpicGamesLauncher.exe'], { stdio: 'ignore' })
        spawn('taskkill', ['/F', '/IM', 'EpicWebHelper.exe'],     { stdio: 'ignore' })
      } catch { /* ignore if not running */ }
      await new Promise(r => setTimeout(r, 600))

      const args = [
        '-epicapp=Fortnite',
        '-epicenv=Prod',
        '-epiclocale=en-us',
        '-epicportal',
        '-noeac',
        '-nobe',
        '-fromfl=eac',
        '-fltoken=none',
        '-skippatchcheck',
        '-AUTH_LOGIN=unused',
        '-AUTH_PASSWORD=unused',
        '-AUTH_TYPE=exchangecode',
      ]
      args.push(`-ironmp_BACKEND=${backendUrl || BACKEND_URL}`)

      const env = { ...process.env }
      delete env['EPIC_GAMES_LAUNCHER_LOCATION']
      delete env['EPIC_DISPLAY_NAME']
      if (dllPath && fs.existsSync(dllPath)) env.ironmp_DLL = dllPath


      const child = spawn(exePath, args, {
        detached: true,
        stdio: 'ignore',
        cwd: path.dirname(exePath),
        env,
      })
      child.unref()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
