const path = require('path')
const Datastore = require('nedb-promise')

export default class {
  constructor (basepath) {
    const filepath = path.join(basepath, 'data', 'data.db')
    this.db = Datastore({ filename: filepath, autoload: true })
    this.db.ensureIndex({ fieldName: 'path', unique: true, sparse: true })
  }

  insert (data) {
    return this.db.insert(data)
  }

  find (query) {
    return this.db.find(query)
  }

  findWithSort (query, sort) {
    return this.db.cfind(query).sort(sort).exec()
  }

  findOne (query) {
    return this.db.findOne(query)
  }

  remove (query) {
    return this.db.remove(query, {})
  }

  clean () {
    this.db.persistence.compactDatafile()
  }
}
