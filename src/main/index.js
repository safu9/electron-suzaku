'use strict'

import { app, BrowserWindow, Menu } from 'electron'
import IPC from './ipc'

const isDevelopment = (process.env.NODE_ENV === 'development')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (!isDevelopment) {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = isDevelopment
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    show: false,
    backgroundColor: '#fff',
    width: 1000,
    height: 550,
    minWidth: 800,
    minHeight: 400,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !isDevelopment
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const ipc = new IPC(mainWindow.webContents)
  ipc.init()

  const onMenuClick = (item, browserWindow, event) => {
    browserWindow.webContents.send('menu_clicked', item.id)
  }
  const template = [
    {
      label: 'File',
      submenu: [
        {
          id: 'settings',
          label: 'Settings',
          accelerator: 'CmdOrCtrl + ,',
          click: onMenuClick
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl + Q',
          click () { app.quit() }
        }
      ]
    },
    {
      label: 'Play',
      submenu: [
        {
          id: 'play',
          label: 'Play / Pause',
          accelerator: 'Space',
          click: onMenuClick
        },
        {
          id: 'next',
          label: 'Next',
          accelerator: 'CmdOrCtrl + Right',
          click: onMenuClick
        },
        {
          id: 'previous',
          label: 'Previous',
          accelerator: 'CmdOrCtrl + Left',
          click: onMenuClick
        },
        { type: 'separator' },
        {
          id: 'turnUp',
          label: 'Turn Up',
          accelerator: 'CmdOrCtrl + Up',
          click: onMenuClick
        },
        {
          id: 'turnDown',
          label: 'Turn Down',
          accelerator: 'CmdOrCtrl + Down',
          click: onMenuClick
        }
      ]
    }
  ]

  if (isDevelopment) {
    template.push({
      label: 'Dev',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    })
  }

  const appMenu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(appMenu)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
