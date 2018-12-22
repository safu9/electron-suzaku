'use strict'

import { app, dialog, ipcMain, BrowserWindow, Menu } from 'electron'
import DB from './db'

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mm = require('music-metadata')

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
      artists: await db.findWithSort({type: 'artist'}, { artistsort: 1 }),
      albums: await db.findWithSort({type: 'album'}, { albumsort: 1 })
    }

    mainWindow.webContents.send('data_loaded', data)
  } catch (err) {
    console.log(err.message)
  }
}

ipcMain.on('select_folder', openFolder)
function openFolder () {
  dialog.showOpenDialog({ properties: ['openDirectory'] }, dirs => {
    if (dirs) {
      const db = new DB(app.getPath('userData'))

      fs.readdir(dirs[0], async (_err, files) => {
        const supportedExt = ['.mp3', '.aac', '.m4a', '.3gp', '.ogg', '.opus', '.flac', '.wav']
        let newTracks = []

        const tracks = await Promise.all(
          files
            .filter(file => {
              const ext = path.extname(file).toLowerCase()
              return supportedExt.includes(ext)
            })
            .map(async (filename) => {
              const filePath = path.join(dirs[0], filename)
              const timestamp = fs.statSync(filePath).mtimeMs

              const doc = await db.findOne({path: filePath})
              if (doc) {
                if (doc.timestamp === timestamp) {
                  return doc
                } else {
                  await db.remove({path: filePath})
                }
              }

              let track = {}
              try {
                const metadata = await mm.parseFile(filePath, {native: true})

                if (metadata.common.picture) {
                  const pic = metadata.common.picture[0]

                  const md5 = crypto.createHash('md5')
                  md5.update(pic.data, 'binary')
                  const hash = md5.digest('hex')
                  const imgpath = path.join(app.getPath('userData'), 'data', hash)
                  if (!fs.existsSync(imgpath)) {
                    fs.writeFile(imgpath, pic.data, (_err) => {})
                  }

                  metadata.common.picture = imgpath
                }

                track = Object.assign(metadata.common, metadata.format)

                track.type = 'track'
                track.path = filePath
                track.filename = filename
                track.timestamp = timestamp

                newTracks.push(track)
              } catch (err) {
                console.log(err.message)
              }

              return track
            })
        )

        const newAlbums = []
        const newArtists = []

        for (const track of newTracks) {
          if (track.album) {
            let album = newAlbums.find(i => (i.type === 'album' && i.album === track.album))
            if (!album) {
              album = await db.findOne({type: 'album', album: track.album})
            }

            if (!album) {
              album = {
                type: 'album',
                album: track.album
              }
              album.albumsort = (track.albumsort || album.album || '').toLowerCase()
              album.artist = track.albumartist || track.artist
              album.artistsort = (track.albumartistsort || track.artistsort || album.artist || '').toLowerCase()
              album.picture = track.picture

              newAlbums.push(album)
            }
          }

          if (track.artist) {
            let artist = newArtists.find(i => (i.type === 'artist' && i.artist === track.artist))
            if (!artist) {
              artist = await db.findOne({type: 'artist', artist: track.artist})
            }

            if (!artist) {
              artist = {
                type: 'artist',
                artist: track.artist
              }
              artist.artistsort = (track.artistsort || artist.artist || '').toLowerCase()

              newArtists.push(artist)
            }
          }
        }

        const newData = newTracks.concat(newAlbums, newArtists)
        await db.insert(newData)

        mainWindow.webContents.send('selected_folder', tracks)
        loadData()
      })
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
