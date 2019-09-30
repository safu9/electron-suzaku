import { app, ipcMain } from 'electron'
import DB from './db'

const { fork } = require('child_process')
const settings = require('electron-settings')
const path = require('path')

export default class {
  constructor (renderer, t) {
    this.db = new DB(app.getPath('userData'))
    this.renderer = renderer

    this.compilationArtist = {
      _id: this.db.compilationID,
      type: 'albumartist',
      artist: t('compilation'),      // i18next
      artistsort: ''
    }
  }

  init () {
    ipcMain.on('load_data', this.loadData.bind(this))
    ipcMain.on('load_album_list', this.loadAlbumList.bind(this))
    ipcMain.on('load_artist_list', this.loadArtistList.bind(this))
    ipcMain.on('load_album', this.loadAlbum.bind(this))
    ipcMain.on('load_artist', this.loadArtist.bind(this))
    ipcMain.on('scan_dirs', this.scanDirs.bind(this))
  }

  async loadData (_event) {
    try {
      const data = {
        artists: await this.db.getAlbumArtists({}).exec(),
        albums: await this.db.getAlbums({}).exec()
      }

      this.renderer.send('data_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadAlbumList (_event) {
    try {
      const data = {
        albums: await this.db.getAlbums({}).exec()
      }

      this.renderer.send('album_list_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadArtistList (_event) {
    try {
      const data = {
        artists: await this.db.getAlbumArtists({}).exec()
      }

      if (await this.db.hasCompilation()) {
        data.artists.unshift(this.compilationArtist)
      }

      this.renderer.send('artist_list_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadAlbum (_event, id) {
    try {
      const album = await this.db.getItem(id).exec()
      if (!album || album.type !== 'album') {
        return
      }

      const data = {
        album: album,
        tracks: await this.db.getTracks({ albumid: album._id }).sort({ 'disk.no': 1, track: 1 }).exec()
      }

      this.renderer.send('album_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadArtist (_event, id) {
    try {
      if (id === this.db.compilationID) {
        this.renderer.send('artist_loaded', {
          artist: this.compilationArtist,
          albums: await this.db.getCompilationAlbums().exec()
        })
        return
      }

      const artist = await this.db.getItem(id).exec()
      if (!artist) {
        return
      }

      const data = {
        artist: artist
      }
      if (artist.type === 'albumartist') {
        data.albums = await this.db.getAlbums({ artistid: artist._id }).exec()
      } else if (artist.type === 'artist') {
        data.albums = await this.db.getAlbums({ artistids: artist._id }).exec()
      } else {
        return
      }

      this.renderer.send('artist_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async scanDirs (event) {
    const dirs = settings.get('core.dirs')
    for (const dir of dirs) {
      await this.scanDir(dir)
    }
    this.db.init()      // reload database
    this.renderer.send('scan_complete')
  }

  scanDir (dir) {
    return new Promise((resolve, reject) => {
      const scanProcess = fork(path.join(__dirname, 'scan'), [this.db.basepath, dir])
      scanProcess.on('message', (message) => {
        if (message.progress) {
          this.renderer.send('scan_progress', message.progress)
        } else if (message.err) {
          console.log(message.err)
        }
      })
      scanProcess.on('exit', (code) => {
        resolve()
      })
    })
  }

  openSettings (_event) {
    this.renderer.send('open_settings')
  }
}
