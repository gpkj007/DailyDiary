const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const fs = require('fs')
const path = require('path')

let mainWindow = null

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js')
  if (!fs.existsSync(preloadPath)) {
    console.error('Preload script not found at:', preloadPath)
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  Menu.setApplicationMenu(null)

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

const USER_DATA = app.getPath('userData')
const SETTINGS_PATH = path.join(USER_DATA, 'settings.json')
const DEFAULT_DIR = path.join(app.getPath('documents'), 'DailyDiary')

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'))
    }
  } catch {}
  return { diaryDir: DEFAULT_DIR }
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8')
  } catch {}
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

const settings = loadSettings()

ipcMain.handle('settings:get', () => {
  console.log('[main] settings:get')
  return loadSettings()
})

ipcMain.handle('settings:setDir', async (_event, dirPath) => {
  console.log('[main] settings:setDir', dirPath)
  const newSettings = { ...loadSettings(), diaryDir: dirPath }
  saveSettings(newSettings)
  ensureDir(dirPath)
  return true
})

ipcMain.handle('dialog:selectDir', async () => {
  console.log('[main] dialog:selectDir')
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择日记保存目录'
  })
  if (!result.canceled && result.filePaths.length > 0) {
    console.log('[main] dialog:selectDir selected:', result.filePaths[0])
    return result.filePaths[0]
  }
  console.log('[main] dialog:selectDir canceled')
  return null
})

ipcMain.handle('diary:getDir', () => {
  const s = loadSettings()
  const dir = ensureDir(s.diaryDir || DEFAULT_DIR)
  console.log('[main] diary:getDir ->', dir)
  return dir
})

ipcMain.handle('diary:scan', async (_event, dirPath) => {
  const targetDir = dirPath || ensureDir(loadSettings().diaryDir || DEFAULT_DIR)
  console.log('[main] diary:scan', targetDir)
  const entries = []
  const scan = (dir) => {
    if (!fs.existsSync(dir)) {
      console.log('[main] diary:scan dir not exists:', dir)
      return
    }
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      if (item.isDirectory()) {
        scan(fullPath)
      } else if (item.isFile() && item.name.endsWith('.md')) {
        const stat = fs.statSync(fullPath)
        entries.push({ name: item.name, path: fullPath, mtime: stat.mtimeMs })
      }
    }
  }
  scan(targetDir)
  console.log('[main] diary:scan result count:', entries.length)
  return entries
})

ipcMain.handle('diary:read', async (_event, filePath) => {
  console.log('[main] diary:read', filePath)
  return fs.readFileSync(filePath, 'utf-8')
})

ipcMain.handle('diary:write', async (_event, filePath, content) => {
  console.log('[main] diary:write', filePath, 'length:', content.length)
  fs.writeFileSync(filePath, content, 'utf-8')
  return true
})

ipcMain.handle('diary:delete', async (_event, filePath) => {
  console.log('[main] diary:delete', filePath)
  fs.unlinkSync(filePath)
  return true
})

ipcMain.handle('diary:create', async (_event, dirPath, dateStr) => {
  console.log('[main] diary:create', dirPath, dateStr)
  const fileName = `${dateStr}.md`
  const filePath = path.join(dirPath, fileName)
  if (fs.existsSync(filePath)) {
    console.log('[main] diary:create already exists:', filePath)
    return { success: false, path: filePath, exists: true }
  }
  const defaultContent = `---\ntitle: ""\ndate: ${dateStr}\ntags: []\n---\n\n`
  fs.writeFileSync(filePath, defaultContent, 'utf-8')
  console.log('[main] diary:create success:', filePath)
  return { success: true, path: filePath, exists: false }
})
