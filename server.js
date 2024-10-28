require('dotenv').config()
const config = require('./model/config');
const utils = require('./model/utils');
const compression = require("compression");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
// const https = require('https');
// const fs = require("fs-extra");

const dirName = config.uploadPath;
require("./model/initialize")();

const app = express();

// middle ware
app.use(compression()); // compress all responses
app.use(express.static(dirName)); // to access the files in `${dirName}` folder
app.use(cors()); // it enables all cors requests
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit : parseInt(process.env.UPLOAD_LIMIT) })); // allow maximum size json payload

/**
 * Server Info API
 */
 const svrAPI = require(`./model/api/${config.apiVersion}/svrinfo`);
 svrAPI.register(app);
/**
 * Auth API
 */
 const authAPI = require(`./model/api/${config.apiVersion}/auth/auth`);
 authAPI.register(app);
 /**
  * L05 API
  */
const l05API = require(`./model/api/${config.apiVersion}/l05/index`);
l05API.register(app);
/**
 * LOG API
 */
const logAPI = require(`./model/api/${config.apiVersion}/log/index`);
logAPI.register(app);
 /**
  * SystemInformation API
  */
const siCpuAPI = require(`./model/api/${config.apiVersion}/systeminformation/cpu`);
siCpuAPI.register(app);
const siHardwareAPI = require(`./model/api/${config.apiVersion}/systeminformation/hardware`);
siHardwareAPI.register(app);
const siGeneralAPI = require(`./model/api/${config.apiVersion}/systeminformation/general`);
siGeneralAPI.register(app);
const siMemoryAPI = require(`./model/api/${config.apiVersion}/systeminformation/memory`);
siMemoryAPI.register(app);
const siGraphicAPI = require(`./model/api/${config.apiVersion}/systeminformation/graphics`);
siGraphicAPI.register(app);
const siOSAPI = require(`./model/api/${config.apiVersion}/systeminformation/os`);
siOSAPI.register(app);
const siLoadingAPI = require(`./model/api/${config.apiVersion}/systeminformation/loading`);
siLoadingAPI.register(app);
const siProcessesAPI = require(`./model/api/${config.apiVersion}/systeminformation/processes`);
siProcessesAPI.register(app);
const siFilesystemAPI = require(`./model/api/${config.apiVersion}/systeminformation/filesystem`);
siFilesystemAPI.register(app);
const siUSBAPI = require(`./model/api/${config.apiVersion}/systeminformation/usb`);
siUSBAPI.register(app);
const siPrinterAPI = require(`./model/api/${config.apiVersion}/systeminformation/printer`);
siPrinterAPI.register(app);
const siNetworkAPI = require(`./model/api/${config.apiVersion}/systeminformation/network`);
siNetworkAPI.register(app);
/**
 * Upload API
 */
// const uploadAPI = require('./model/api/upload');
// uploadAPI.register(app);

// const privateKey  = fs.readFileSync(path.resolve(__dirname, 'assets', 'key', config.isProd ? 'server.key' : 'localhost-key.pem'));
// const certificate = fs.readFileSync(path.resolve(__dirname, 'assets', 'key', config.isProd ? 'server.crt' : 'localhost.pem'));
// const credentials = { key: privateKey, cert: certificate};

// const httpsServer = https.createServer(credentials, app);

// httpsServer.listen(process.env.SVR_PORT || 8082, () => {
//   console.log(`LAH MONITORING 伺服器已於 ${process.env.SVR_PORT || 8082} 埠號啟動。`);
// });

const SERVER_PORT = process.env.SVR_PORT || 8082;
const server = app.listen(SERVER_PORT, () => {
  console.log(`REST API伺服器已於 ${utils.ip}:${SERVER_PORT} 埠號啟動。`);
});

/**
 * Start WebSocket Server
 */
const WebSocket = require('ws')
const RequestHandler = require(path.join(__dirname, 'model', 'wss', 'request-handler.js'))
try{
  // initialize WS server
  const wss = new WebSocket.Server({ server })
  const handler = new RequestHandler(wss)
  // new connection handler for remote client
  wss.on('connection', function connection (ws, req) {
    ws.wss = this // reference to the server
    ws.isAlive = true
    ws.on('pong', function heartbeat (data) {
      // only ws has user info is treated as alive
      utils.log('連線客戶端資料', data)
    })

    ws.on('message', function incoming (message) {
      const processedMessage = handler.handle(this, message)
      if (processedMessage === false) {
        utils.log('處理訊息失敗', message)
        this.send(utils.packMessage(`WS伺服器無法處理您的請求 ${message}`))
      } else if (processedMessage === true) {
        utils.log('處理訊息成功')
      } else if (!utils.isEmpty(processedMessage)) {
        this.send(utils.packMessage(processedMessage, { channel: this.user.userid }))
      } else {
        utils.log('處理訊息後無回傳值，無法處理給客戶端回應', message)
      }
    })

    ws.on('close', function close () {
      const disconnected_user = this.user
      if (disconnected_user) {
        // send user_disconnected command to all ws clients
        wss?.clients?.forEach((ws) => {
          utils.sendCommand(ws, {
            command: 'user_disconnected',
            payload: disconnected_user,
            message: `${disconnected_user.username} 已離線`
          })
        })
      } else {
        utils.warn('WebSocket內沒有使用者資訊')
      }
      utils.log(`目前已連線客戶數 ${[...wss.clients].length}`)
    })

    utils.log(`目前已連線客戶數 ${[...wss.clients].length}`)
  })

  // remove dead connection every 20s
  const interval = setInterval(function ping () {
    wss.clients.forEach(function each (ws) {
      if (ws.isAlive === false) {
        ws.user && utils.log(`偵測到 ${ws.user.dept} / ${ws.user.userid} 的連線已中斷。`)
        !ws.user && utils.log('偵測到無使用者資訊的連線，斷線 ... ')
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping(function noop () {})
    })
  }, 20000)

  wss.on('close', function close () {
    clearInterval(interval)
  })

  console.log(`WebSocket伺服器已隨API伺服器啟動。`)
} catch (e) {
  console.error('WebSocket伺服器啟動失敗', e)
} finally {
// finally。
}