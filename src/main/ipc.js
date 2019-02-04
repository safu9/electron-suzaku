import { app, dialog, ipcMain } from 'electron'
import DB from './db'

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
    ipcMain.on('select_folder', this.openFolder.bind(this))
  }

  async loadData (_event) {
    try {
      const data = {
        artists: await this.db.getArtists({}).exec(),
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
        artists: await this.db.getArtists({}).exec()
      }

      this.renderer.send('artist_list_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadAlbum (_event, arg) {
    try {
      const albums = await this.db.getAlbums({_id: arg}).exec()
      if (!albums || albums.length === 0) {
        return
      }

      const data = {
        album: albums[0],
        tracks: await this.db.getTracks({album: albums[0].album}).sort({track: 1}).exec()
      }

      this.renderer.send('album_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  async loadArtist (_event, arg) {
    try {
      const artists = await this.db.getArtists({_id: arg}).exec()
      if (!artists || artists.length === 0) {
        return
      }

      const data = {
        artist: artists[0],
        albums: await this.db.getAlbums({artist: artists[0].artist}).sort({album: 1}).exec()
      }

      this.renderer.send('artist_loaded', data)
    } catch (err) {
      console.log(err.message)
    }
  }

  openFolder (_event) {
    dialog.showOpenDialog({ properties: ['openDirectory'] }, async (dirs) => {
      if (dirs) {
        const data = {
          dir: dirs[0],
          tracks: await this.db.scanDir(dirs[0])
        }

        this.renderer.send('selected_folder', data)
        this.loadData()
      }
    })
  }
}