'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { GET_VCLASH_CONFIG, FETCH_PROFILES, ADD_PROFILE, SWITCH_PROFILE, RELOAD_PROFILE, DELETE_PROFILE, SWITCH_PROXY } from './native-support/message-constant'
import { getCurrentConfig, initConfigsIfNeeded, switchProfile, switchProxy } from './native-support/configs-manager'
import { fetchProfiles } from './native-support/profiles-manager'
import { addProfile, reloadProfile, deleteProfile } from './native-support/subscription-updater'
import { spawnClash, killClash } from './native-support/clash-binary'
import * as path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  })
  win.setFullScreenable(false)
  win.setResizable(false)
  win.removeMenu()
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('will-quit', () => {
  killClash()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  ipcMain.handle(GET_VCLASH_CONFIG, getCurrentConfig)
  ipcMain.handle(FETCH_PROFILES, fetchProfiles)
  ipcMain.handle(SWITCH_PROFILE, switchProfile)
  ipcMain.handle(ADD_PROFILE, addProfile)
  ipcMain.handle(DELETE_PROFILE, deleteProfile)
  ipcMain.handle(RELOAD_PROFILE, reloadProfile)
  ipcMain.handle(SWITCH_PROXY, switchProxy)
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  await initConfigsIfNeeded()
  try {
    spawnClash()
  } catch {
    console.error(e)
  }

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}