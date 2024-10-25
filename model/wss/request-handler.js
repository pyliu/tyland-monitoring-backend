const path = require('path')
const utils = require(path.join(__dirname, '..', 'utils.js'))

const isDev = process.env.NODE_ENV !== 'production'

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

    isDev && console.log('收到客戶端訊息', incoming)

    if (incoming.channel === undefined && incoming.message.channel === undefined) {
      console.warn('沒有頻道資訊，無法處理此訊息', incoming)
      return
    }

    if (typeof incoming === 'object' && incoming.type) {
      switch (incoming.type) {
        case 'command':
          // handle system command
          return this.handleCommandRequest(ws, incoming.message)
        case 'mine':
          // client side sends message
          return this.handleClientRequest(ws, incoming)
        default:
          return false
      }
    } else {
      console.warn(`${incoming} is not a valid json object, skip the request ... `, `RAW: ${incomingRaw}`)
    }
    return false
  }

  handleCommandRequest (ws, message) {
    const json = typeof message === 'string' ? JSON.parse(message) : message
    const cmd = json.command
    switch (cmd) {
      case 'test':
        return this.executeTestCommand(ws, json)
      default:
        console.warn(`不支援的命令 ${cmd}`)
    }
    return false
  }

  executeTestCommand (ws, args) {
    /** expected args json format
      {
        command: 'register',
        ip: '192.168.24.2',
        domain: 'HBWEB',
        userid: 'HB0541',
        username: 'WHOAMI',
        dept: 'inf',
      }
     */
    const valid = typeof args === 'object'
    // inject client information into ws instance, currently it should contain ip, domain and username from remote client
    valid && (ws.user = { ...args, timestamp: +new Date() })

    const message = valid ? `遠端客戶端資料 (${ws.user.ip}, ${ws.user.domain}, ${ws.user.userid}, ${ws.user.username}, ${ws.user.dept}) 已儲存於 ws 物件中` : '無法完成 register 命令，因為格式不符'
    console.log(message)
    !valid && console.warn('收到參數', args)
    isDev && console.log('WS中的使用者資訊', ws.user)

    utils.sendAck(ws, {
      command: 'register',
      payload: ws.user,
      success: valid,
      message
    }, -1)

    // send user_connected command to all ws clients
    const connected_user = ws.user
    ws.wss?.clients?.forEach((ws) => {
      utils.sendCommand(ws, {
        command: 'user_connected',
        payload: connected_user,
        message: `${connected_user.username} 已上線`
      })
    })

    return valid
  }

  handleClientRequest (ws, json) {
    console.log(json)
    return true
  }
}
module.exports = RequestHandler
