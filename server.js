require('dotenv').config()
const config = require('./model/config');
const utils = require('./model/utils');
const compression = require("compression");
const express = require("express");
const helmet = require('helmet');
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
app.use(helmet());
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
  console.log(utils.timestamp(), `REST API伺服器已於 ${utils.ip}:${SERVER_PORT} 埠號啟動。`);
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
    ws.remoteAddress = req.socket.remoteAddress
    ws.on('pong', function heartbeat (data) {
      // received pong treated as alive
      // utils.log('收到PONG')
      ws.isAlive = true
    })

    ws.on('message', function incoming (message) {
      // 分派訊息給各工作物件
      const processedMessage = handler.handle(this, message)
      if (processedMessage === false) {
        utils.log('WSS: 處理訊息失敗')
        this.send(utils.packWsData({
          command: '@ack_server',
          success: false,
          payload: {
            message: 'WS伺服器無法處理您的請求'
          }
        }))
      } else if (processedMessage === true) {
        utils.log('WSS: 處理訊息成功')
      } 
    })

    ws.on('close', function close () {
      utils.log(`${this.remoteAddress}已離線，目前總連線數 ${[...wss.clients].length}`)
    })

    utils.log(`${ws.remoteAddress}已連線，目前總連線數 ${[...wss.clients].length}`)
  })

  // remove dead connections every 30s
  const interval = setInterval(function ping () {
    wss.clients.forEach(function each (ws) {
      if (ws.isAlive === false) {
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping(function noop () {})
    })
  }, 30 * 1000)

  wss.on('close', function close () {
    clearInterval(interval)
    wss.clients.forEach(function each (ws) {
      return ws.terminate()
    })
  })

  /**
   * Other operation when WS server started
   */

  console.log(utils.timestamp(), `WebSocket伺服器已隨API伺服器啟動。`)
} catch (e) {
  console.error(utils.timestamp(), 'WebSocket伺服器啟動失敗', e)
} finally {
// finally。
}