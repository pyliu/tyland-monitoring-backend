const path = require('path')
const utils = require(path.join(__dirname, '..', '..', 'utils.js'))

class ReadFileCommand {
  ws = null
  json = null
  constructor (inWs, inJson) {
    this.ws = inWs
    this.json = inJson
    this.command = this.json.command
  }

  execute () {
    utils.log(`準備開始讀取檔案 ${this.json.path}`)

    const fs = require('fs-extra');
    if (fs.existsSync(this.json.path)) {
      const data = fs.readFileSync(this.json.path)
      utils.log(`已讀取 ${data.length} bytes`)
      const base64 = data.toString('base64')
      this.ws.send(utils.packWsData({
        command: '@read_file',
        binary: true,
        payload: base64
      }))
      return true
    }
    this.ws.send(utils.packWsData({
      command: '@read_file',
      payload: 'FAILED'
    }))
    return false
  }
}
module.exports = ReadFileCommand
