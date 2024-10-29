const path = require('path')
const utils = require(path.join(__dirname, '..', 'utils.js'))

class RequestHandler {
  constructor (wss) {
    // singleton
    if (!RequestHandler._instance) {
      RequestHandler._instance = this
      // WebSocket Server
      this.wss = wss
    }
    return RequestHandler._instance
  }

  handle (ws, incomingRaw) {
    const incoming = JSON.parse(incomingRaw)

    utils.log('收到客戶端訊息', incoming)

    const cmd = incoming.command
    switch (cmd) {
      case '@read_file':
        const ReadFileCommand = require(path.join(__dirname, 'commands', 'readFile.js'))
        const payload = incoming.payload
        const handler = new ReadFileCommand(ws, payload)
        return handler.execute()
      default:
        utils.warn(`不支援的命令 ${cmd}`)
    }
    return false
  }
}
module.exports = RequestHandler
