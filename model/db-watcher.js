const path = require('path')
const utils = require('./utils.js')

class DBWatcher {
  constructor (wss) {
    // singleton
    if (!DBWatcher._instance) {
      DBWatcher._instance = this
      // WebSocket Server
      DBWatcher._instance.wss = wss
      // watch db folder for changes
      // https://github.com/paulmillr/chokidar, more flexible watcher project
      const chokidar = require('chokidar')
      DBWatcher._instance.watcher = chokidar.watch(path.join(__dirname, '..', 'assets', 'db'), {
        persistent: true,
      
        // ignore .txt files
        // ignored: (file) => file.endsWith('.txt'),
        // watch only .db files
        ignored: (file, _stats) => _stats?.isFile() && !file.endsWith('.db'),
      
        awaitWriteFinish: true, // emit single event when chunked writes are completed
        atomic: true, // emit proper events when "atomic writes" (mv _tmp file) are used
      
        // The options also allow specifying custom intervals in ms
        // awaitWriteFinish: {
        //   stabilityThreshold: 2000,
        //   pollInterval: 100
        // },
        // atomic: 100,
      
        interval: 100,
        binaryInterval: 300,
      
        cwd: '.',
        depth: 99,
      
        followSymlinks: true,
        ignoreInitial: false,
        ignorePermissionErrors: false,
        usePolling: false,
        alwaysStat: false,
      })
      // One-liner for current directory
      this.watcher.on('all', this.watchHandler);// Add event listeners.
      // const log = utils.log.bind(utils)
      // this.watcher
      //   .on('add', path => log(`File ${path} has been added`))
      //   .on('change', path => log(`File ${path} has been changed`))
      //   .on('unlink', path => log(`File ${path} has been removed`));
      
      // // More possible events.
      // this.watcher
      //   .on('addDir', path => log(`Directory ${path} has been added`))
      //   .on('unlinkDir', path => log(`Directory ${path} has been removed`))
      //   .on('error', error => log(`Watcher error: ${error}`))
      //   .on('ready', () => log('Initial scan complete. Ready for changes'))
      //   .on('raw', (event, path, details) => { // internal
      //     log('Raw event info:', event, path, details);
      //   });

    }
    return DBWatcher._instance
  }

  watchHandler (evt, fpath) {
    // To watch *.db files modification
    const filename = path.basename(fpath, '.db')
    utils.log(evt, fpath, filename)
  }
}
module.exports = DBWatcher
