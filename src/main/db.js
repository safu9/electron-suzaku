const path = require('path')
const Datastore = require('nedb-promise')


export default class {
  constructor (basepath) {
    this.basepath = basepath
    this.init()
  }

  init () {
    const filepath = path.join(this.basepath, 'data', 'data.db')
    this.db = Datastore({ filename: filepath, autoload: true })
    this.db.ensureIndex({ fieldName: 'path', unique: true, sparse: true })
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
