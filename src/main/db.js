const fs = require('fs')
const fsPromise = require('fs').promises
const path = require('path')
const crypto = require('crypto')
const mm = require('music-metadata')
const Datastore = require('nedb-promise')

async function readFiles (basePath) {
  const dirs = await fsPromise.readdir(basePath, { withFileTypes: true })

  const files = await Promise.all(
    dirs.map(async (dir) => {
      const dirPath = path.join(basePath, dir.name)
      if (dir.isDirectory()) {
        return readFiles(dirPath)
      } else {
        return dirPath
      }
    })
  )

  return files.flat()
}

export default class {
  constructor (basepath) {
    this.basepath = basepath

    const filepath = path.join(basepath, 'data', 'data.db')
    this.db = Datastore({ filename: filepath, autoload: true })
    this.db.ensureIndex({ fieldName: 'path', unique: true, sparse: true })
  }

  // Scan files

  async scanDirs (dirs) {
    const files = await Promise.all(
      dirs.map((dir) => { return readFiles(dir) })
    )

    const supportedExt = ['.mp3', '.aac', '.m4a', '.3gp', '.ogg', '.opus', '.flac', '.wav']

    // Create list of new tracks

    const newTracks = (await Promise.all(
      files.flat()
        .filter(file => {
          const ext = path.extname(file).toLowerCase()
          return supportedExt.includes(ext)
        })
        .map(async (filePath) => {
          const timestamp = fs.statSync(filePath).mtimeMs
          const doc = await this.db.findOne({ path: filePath })
          if (doc) {
            if (doc.timestamp === timestamp) {
              return null
            } else {
              await this.db.remove({ path: filePath })
            }
          }

          try {
            const track = await this._parseFile(filePath)
            track.type = 'track'
            track.path = filePath
            track.filename = path.parse(filePath).name
            track.timestamp = timestamp
            return track
          } catch (err) {
            console.log(err.message)
            return null
          }
        })
    )).filter((track) => track)

    // Create list of new albums

    let newAlbums = []
    for (const track of newTracks) {
      if (!track.album) {
        continue
      }

      let album = newAlbums.find(i => (i.album === track.album)) || await this.db.findOne({ type: 'album', album: track.album })

      // Set relation from track to existing album
      if (album && album._id) {
        track.albumid = album._id
      }

      if (!album) {
        album = { type: 'album' }
        album.album = track.album
        album.albumsort = (track.albumsort || album.album || '').toLowerCase()
        album.artist = track.albumartist || track.artist
        album.artistsort = (track.albumartistsort || track.artistsort || album.artist || '').toLowerCase()
        album.picture = track.picture
        newAlbums.push(album)
      }
    }

    // Create list of new album-artists

    let newAlbumArtists = []
    for (const album of newAlbums) {
      if (!album.artist) {
        continue
      }

      let artist = newAlbumArtists.find(i => (i.artist === album.artist)) || await this.db.findOne({ type: 'albumartist', artist: album.artist })

      // Set relation from album to existing album-artist
      if (artist && artist._id) {
        album.artistid = artist._id
      }

      if (!artist) {
        artist = { type: 'albumartist' }
        artist.artist = album.artist
        artist.artistsort = (album.artistsort || artist.artist || '').toLowerCase()
        newAlbumArtists.push(artist)
      }
    }

    // Create list of new artists

    let newArtists = []
    for (const track of newTracks) {
      if (!track.artist) {
        continue
      }

      let artist = newArtists.find(i => (i.artist === track.artist)) || await this.db.findOne({ type: 'artist', artist: track.artist })

      // Set relation from track to existing artist
      if (artist && artist._id) {
        track.artistid = artist._id
      }

      if (!artist) {
        artist = { type: 'artist' }
        artist.artist = track.artist
        artist.artistsort = (track.artistsort || artist.artist || '').toLowerCase()
        newArtists.push(artist)
      }
    }

    newArtists = await this.db.insert(newArtists)

    // Set relations from track to new artist
    for (const artist of newArtists) {
      newTracks.filter((t) => (t.artist === artist.artist)).map((t) => {
        t.artistid = artist._id
      })
    }

    // Set relations from album to artist
    for (const track of newTracks) {
      if (!track.artistid || !track.album) {
        continue
      }

      const album = newAlbums.find(i => (i.album === track.album)) || await this.db.findOne({ type: 'album', album: track.album })
      if (album) {
        if (!album.artistids) {
          album.artistids = [track.artistid]
        } else if (!album.artistids.includes(track.artistid)) {
          album.artistids.push(track.artistid)
        }

        if (album && album._id) {
          this.db.update({ id: album._id }, { $set: { artistids: album.artistids } })
        }
      }
    }

    newAlbumArtists = await this.db.insert(newAlbumArtists)

    // Set relations from album to new album-artist
    for (const artist of newAlbumArtists) {
      newAlbums.filter((a) => (a.artist === artist.artist)).map((a) => {
        a.artistid = artist._id
      })
    }

    newAlbums = await this.db.insert(newAlbums)

    // Set relations from track to new album
    for (const album of newAlbums) {
      newTracks.filter((t) => (t.album === album.album)).map((t) => {
        t.albumid = album._id
      })
    }

    await this.db.insert(newTracks)
  }

  async _parseFile (filePath) {
    const metadata = await mm.parseFile(filePath, { native: true })

    if (metadata.common.picture) {
      const pic = metadata.common.picture[0]
      metadata.common.picture = this._saveImage(pic.data)
    }

    return Object.assign(metadata.common, metadata.format)
  }

  _saveImage (data) {
    const md5 = crypto.createHash('md5')
    md5.update(data, 'binary')
    const hash = md5.digest('hex')
    const imgpath = path.join(this.basepath, 'data', hash)
    if (!fs.existsSync(imgpath)) {
      fs.writeFile(imgpath, data, (_err) => {})
    }
    return imgpath
  }

  // Get data

  getItem (id) {
    return this.db.cfindOne({ _id: id })
  }

  getTracks (query) {
    query.type = 'track'
    return this.db.cfind(query)
  }

  getAlbums (query) {
    query.type = 'album'
    return this.db.cfind(query).sort({ albumsort: 1 })
  }

  getArtists (query) {
    query.type = 'artist'
    return this.db.cfind(query).sort({ artistsort: 1 })
  }

  getAlbumArtists (query) {
    query.type = 'albumartist'
    return this.db.cfind(query).sort({ artistsort: 1 })
  }

  clean () {
    this.db.persistence.compactDatafile()
  }
}
