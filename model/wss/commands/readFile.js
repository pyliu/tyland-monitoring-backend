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
    const mime = require('mime-types');
    if (fs.existsSync(this.json.path)) {
      fs.readFile(this.json.path).then((data) => {
        const filename = path.basename(this.json.path)
        const message = `已讀取 ${filename} ${data.length} bytes`
        utils.log(message)
        const base64 = data.toString('base64')
        this.ws.send(utils.packWsData({
          command: '@read_file_ack',
          success: true,
          payload: {
            binary: true,
            mime: mime.lookup(this.json.path),
            data: base64,
            message,
            filename
          }
        }))
        utils.log(`已傳送檔案 ${filename} 回 ${this.ws.remoteAddress}`)
      }).catch((e) => {
        this.ws.send(utils.packWsData({
          command: '@read_file_ack',
          success: false,
          payload: {
            binary: false,
            message: e.toString()
          }
        }))
      })
      return true
    }
    const message = `${this.json.path}不存在`
    utils.log(message)
    this.ws.send(utils.packWsData({
      command: '@read_file_ack',
      success: false,
      payload: {
        binary: false,
        message
      }
    }))
    return false
  }
}
module.exports = ReadFileCommand
