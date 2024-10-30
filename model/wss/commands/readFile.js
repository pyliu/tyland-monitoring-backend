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
        const message = `已讀取 ${data.length} bytes`
        utils.log(message)
        const base64 = data.toString('base64')
        this.ws.send(utils.packWsData({
          command: '@ack_read_file',
          success: true,
          payload: {
            binary: true,
            filename: path.basename(this.json.path),
            mime: mime.lookup(this.json.path),
            data: base64,
            message
          }
        }))
        utils.log(`已傳送 Binary Data 回客戶端`)
      }).catch((e) => {
        this.ws.send(utils.packWsData({
          command: '@ack_read_file',
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
      command: '@ack_read_file',
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
