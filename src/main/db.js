const path = require('path')
const Datastore = require('nedb')

export default class {
  constructor (basepath) {
    const filepath = path.join(basepath, 'data', 'data.db')
    this.db = new Datastore({ filename: filepath, autoload: true })
    this.db.ensureIndex({ fieldName: 'path', unique: true, sparse: true }, (_err) => {})
  }

  insert (data) {
    return new Promise((resolve, reject) => {
      this.db.insert(data, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  find (query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  findWithSort (query, sort) {
    return new Promise((resolve, reject) => {
      this.db.find(query).sort(sort).exec((err, docs) => {
        if (err) {
          reject(err)
        } else {
          resolve(docs)
        }
      })
    })
  }

  findOne (query) {
    return new Promise((resolve, reject) => {
      this.db.findOne(query, (err, doc) => {
        if (err) {
          reject(err)
        } else {
          resolve(doc)
        }
      })
    })
  }

  remove (query) {
    return new Promise((resolve, reject) => {
      this.db.remove(query, {}, (err, numRemoved) => {
        if (err) {
          reject(err)
        } else {
          resolve(numRemoved)
        }
      })
    })
  }

  clean () {
    this.db.persistence.compactDatafile()
  }
}
