const path = require('path')
const utils = require('./utils.js')

class DBWatcher {
  constructor (wss) {
    // singleton
    if (!DBWatcher._instance) {
      DBWatcher._instance = this
      // WebSocket Server
      DBWatcher.wss = wss
      // watch db folder for changes
      const nodeWatch = require('node-watch')
      nodeWatch(
        path.join(__dirname, '..', 'assets', 'db'),
        { recursive: true, filter: /\.db$/ },
        this.watchHandler
      )
    }
    return DBWatcher._instance
  }

  watchHandler (evt, name) {
    // To watch *.db files modification
    const filename = path.basename(name, '.db')
    utils.log(evt, name, filename)
  }
}
module.exports = DBWatcher
