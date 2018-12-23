const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mm = require('music-metadata')
const Datastore = require('nedb-promise')

function readdirAsync (path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

export default class {
  constructor (basepath) {
    this.basepath = basepath

    const filepath = path.join(basepath, 'data', 'data.db')
    this.db = Datastore({ filename: filepath, autoload: true })
    this.db.ensureIndex({ fieldName: 'path', unique: true, sparse: true })
  }

  async scanDir (dir) {
    const files = await readdirAsync(dir)

    const supportedExt = ['.mp3', '.aac', '.m4a', '.3gp', '.ogg', '.opus', '.flac', '.wav']
    let newTracks = []

    const tracks = await Promise.all(
      files
        .filter(file => {
          const ext = path.extname(file).toLowerCase()
          return supportedExt.includes(ext)
        })
        .map(async (filename) => {
          const filePath = path.join(dir, filename)
          const timestamp = fs.statSync(filePath).mtimeMs

          const doc = await this.db.findOne({path: filePath})
          if (doc) {
            if (doc.timestamp === timestamp) {
              return doc
            } else {
              await this.db.remove({path: filePath})
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
              const imgpath = path.join(this.basepath, 'data', hash)
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

    let newAlbums = []
    let newArtists = []

    for (const track of newTracks) {
      if (track.album) {
        let album = newAlbums.find(i => (i.album === track.album))
        if (!album) {
          album = await this.db.findOne({type: 'album', album: track.album})
          if (album) {
            track.albumid = album._id
          }
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
        let artist = newArtists.find(i => (i.artist === track.artist))
        if (!artist) {
          artist = await this.db.findOne({type: 'artist', artist: track.artist})
          if (artist) {
            track.artistid = artist._id
          }
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

    newAlbums = await this.db.insert(newAlbums)
    for (const album of newAlbums) {
      newTracks.filter((t) => (t.album === album.album)).map((t) => {
        t.albumid = album._id
      })
    }

    newArtists = await this.db.insert(newArtists)
    for (const artist of newArtists) {
      newTracks.filter((t) => (t.artist === artist.artist)).map((t) => {
        t.artistid = artist._id
      })
    }

    await this.db.insert(newTracks)

    return tracks
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

  clean () {
    this.db.persistence.compactDatafile()
  }
}
