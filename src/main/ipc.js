import { app, ipcMain } from 'electron'
import DB from './db'

const settings = require('electron-settings')

export default class {
  constructor (renderer) {
    this.db = new DB(app.getPath('userData'))
    this.renderer = renderer
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

      this.renderer.send('artist_list_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadAlbum (_event, arg) {
    try {
      const albums = await this.db.getAlbums({ _id: arg }).exec()
      if (!albums || albums.length === 0) {
        return
      }

      const data = {
        album: albums[0],
        tracks: await this.db.getTracks({ albumid: albums[0]._id }).sort({ track: 1 }).exec()
      }

      this.renderer.send('album_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadArtist (_event, arg) {
    try {
      let artists = await this.db.getAlbumArtists({ _id: arg }).exec()
      let data

      if (artists && artists.length) {
        data = {
          artist: artists[0],
          albums: await this.db.getAlbums({ artistid: artists[0]._id }).exec()
        }
      } else {
        artists = await this.db.getArtists({ _id: arg }).exec()
        if (!artists || artists.length === 0) {
          return
        }

        data = {
          artist: artists[0],
          albums: await this.db.getAlbums({ artistids: artists[0]._id }).exec()
        }
      }

      this.renderer.send('artist_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async scanDirs (event) {
    const dirs = settings.get('core.dirs')
    await this.db.scanDirs(dirs)
    this.loadData(event)
  }

  openSettings (_event) {
    this.renderer.send('open_settings')
  }
}
