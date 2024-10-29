const path = require('path')
const utils = require(path.join(__dirname, '..', '..', 'utils.js'))

class ReadFileCommand {
  ws = null
  json = null
  constructor (inWs, inJson) {
    this.ws = inWs
    this.json = inJson
  }

  execute () {
    utils.log('準備開始讀取檔案')
    return true
  }
}
module.exports = ReadFileCommand
