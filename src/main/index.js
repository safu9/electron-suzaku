'use strict'

import { app, dialog, ipcMain, BrowserWindow, Menu } from 'electron'
import DB from './db'

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
  ? `http://localhost:9080`
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

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl + O',
          click: openFolder
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl + Q',
          click () {
            app.quit()
          }
        }
      ]
    }
  ]

  if (isDevelopment) {
    template.push({
      label: 'Dev',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    })
  }

  let appMenu = Menu.buildFromTemplate(template)
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

ipcMain.on('load_data', loadData)
async function loadData () {
  const db = new DB(app.getPath('userData'))

  try {
    const data = {
      artists: await db.getArtists({}).exec(),
      albums: await db.getAlbums({}).exec()
    }

    mainWindow.webContents.send('data_loaded', data)
  } catch (err) {
    console.log(err.message)
  }
}

ipcMain.on('load_album', loadAlbum)
async function loadAlbum (_event, arg) {
  const db = new DB(app.getPath('userData'))

  try {
    const albums = await db.getAlbums({_id: arg}).exec()
    if (!albums || albums.length === 0) {
      return
    }

    const data = {
      album: albums[0],
      tracks: await db.getTracks({album: albums[0].album}).sort({track: 1}).exec()
    }

    mainWindow.webContents.send('album_loaded', data)
  } catch (err) {
    console.log(err.message)
  }
}

ipcMain.on('load_artist', loadArtist)
async function loadArtist (_event, arg) {
  const db = new DB(app.getPath('userData'))

  try {
    const artists = await db.getArtists({_id: arg}).exec()
    if (!artists || artists.length === 0) {
      return
    }

    const data = {
      artist: artists[0],
      albums: await db.getAlbums({artist: artists[0].artist}).sort({album: 1}).exec()
    }

    mainWindow.webContents.send('artist_loaded', data)
  } catch (err) {
    console.log(err.message)
  }
}

ipcMain.on('select_folder', openFolder)
function openFolder () {
  dialog.showOpenDialog({ properties: ['openDirectory'] }, async (dirs) => {
    if (dirs) {
      const db = new DB(app.getPath('userData'))

      const data = {
        dir: dirs[0],
        tracks: await db.scanDir(dirs[0])
      }

      mainWindow.webContents.send('selected_folder', data)
      loadData()
    }
  })
}

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
