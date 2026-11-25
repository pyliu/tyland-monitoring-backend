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
// const options = {
//   key: fs.readFileSync(`assets/key/key.pem`),
//   cert: fs.readFileSync(`assets/key/cert.pem`),
// }

const dirName = config.uploadPath;
require("./model/initialize")();

const app = express();
app.disable('x-powered-by');

// middle ware
app.use(compression()); // compress all responses
app.use(express.static(dirName)); // to access the files in `${dirName}` folder
app.use(cors()); // it enables all cors requests
app.use(helmet());  // Helmet 會適當設定 HTTP 標頭，有助於防範您的應用程式出現已知的 Web 漏洞。
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({limit : parseInt(process.env.UPLOAD_LIMIT) })); // allow maximum size json payload

// HTTP 請求日誌中介軟體
app.use((req, res, next) => {
  const startTime = Date.now();
  const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const msg = `HTTP ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms) [${clientIp}]`;
    if (res.statusCode >= 500) {
      utils.error(msg);
    } else if (res.statusCode >= 400) {
      utils.warn(msg);
    } else {
      utils.info(msg);
    }
  });
  next();
});

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
/**
 * Not using HTTPS because there is no way to ignore certificate checking on client BROWSER without cert installation to root CA
 */
// const server =  https.createServer(options, app);
// server.on('error', (error) => {
//   if (error.syscall !== 'listen') {
//     throw error
//   }

//   var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

//   // handle specific listen errors with friendly messages
//   switch (error.code) {
//     case 'EACCES':
//       console.error(bind + ' 需要提升權限')
//       process.exit(1)
//       break
//     case 'EADDRINUSE':
//       console.error(bind + ' 已經被占用')
//       process.exit(1)
//       break
//     default:
//       throw error
//   }
// })
// server.listen(SERVER_PORT,() => {
//   const addr = server.address();
//   (config.isDev || config.isDebug) && console.log(addr);
//   console.log(utils.timestamp(), `HTTPS REST API伺服器已於 ${utils.ip}:${addr.port} 埠號啟動。`);
// });
const server = app.listen(SERVER_PORT, () => {
  utils.info(`REST API伺服器已於 ${utils.ip}:${SERVER_PORT} 埠號啟動 (NODE_ENV=${process.env.NODE_ENV || 'development'}, DEBUG=${config.isDebug})。`);
  if (typeof process.send === 'function') {
    process.send('ready');
    utils.info('已發送 PM2 ready 訊號。');
  }
});

server.on('error', (err) => {
  utils.error('REST API伺服器發生錯誤:', err);
});

/**
 * Start WebSocket Server
 */
const WebSocket = require('ws')
const RequestHandler = require(path.join(__dirname, 'model', 'wss', 'request-handler.js'))
const DBWatcher = require(path.join(__dirname, 'model', 'db-watcher.js'))
let wss = null
let wsPingInterval = null
let heartbeatLogTimer = null

try{
  // initialize WS server
  wss = new WebSocket.Server({ server })
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
        utils.warn(`WSS: 處理來自 ${this.remoteAddress} 的訊息失敗`)
        this.send(utils.packWsData({
          command: '@ack_server',
          success: false,
          payload: {
            message: 'WS伺服器無法處理您的請求'
          }
        }))
      } else if (processedMessage === true) {
        utils.log(`WSS: 處理來自 ${this.remoteAddress} 的訊息成功`)
      } 
    })

    ws.on('error', function wsError (err) {
      utils.error(`WSS 客戶端 (${this.remoteAddress}) 發生錯誤:`, err)
    })

    ws.on('close', function close (code, reason) {
      utils.info(`WSS: ${this.remoteAddress} 已離線 (code=${code}, reason=${reason?.toString() || '無'})，目前總連線數 ${[...wss.clients].length}`)
    })

    utils.info(`WSS: ${ws.remoteAddress} 已連線，目前總連線數 ${[...wss.clients].length}`)
  })

  wss.on('error', function wssError (err) {
    utils.error('WebSocket伺服器發生錯誤:', err)
  })

  // remove dead connections every 30s
  wsPingInterval = setInterval(function ping () {
    wss.clients.forEach(function each (ws) {
      if (ws.isAlive === false) {
        utils.warn(`WSS: 偵測到 ${ws.remoteAddress} 心跳逾時，強制中斷連線`)
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping(function noop () {})
    })
  }, 30 * 1000)

  wss.on('close', function close () {
    clearInterval(wsPingInterval)
    wss.clients.forEach(function each (ws) {
      return ws.terminate()
    })
  })

  /**
   * Other operation when WS server started
   */
  const handler = new RequestHandler(wss)
  const watcher = new DBWatcher(wss)

  utils.info(`WebSocket伺服器已隨API伺服器啟動。`)
} catch (e) {
  utils.error('WebSocket伺服器啟動失敗', e)
}

/**
 * 背景健康心跳日誌，讓監管工具可持續確認服務運作狀態
 */
if (config.heartbeatLogIntervalMs > 0) {
  heartbeatLogTimer = setInterval(() => {
    const memMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const uptimeSec = Math.floor(process.uptime());
    const wsCount = wss ? wss.clients.size : 0;
    utils.info(`服務運作中 | Uptime: ${uptimeSec}s | 記憶體(RSS): ${memMB} MB | WS連線數: ${wsCount}`);
  }, config.heartbeatLogIntervalMs);
  if (typeof heartbeatLogTimer.unref === 'function') {
    heartbeatLogTimer.unref();
  }
  utils.info(`已啟用背景心跳日誌，每 ${Math.round(config.heartbeatLogIntervalMs / 1000)} 秒輸出一次狀態。`);
}

/**
 * 全域未捕捉例外與優雅關閉處理
 */
process.on('uncaughtException', (err) => {
  utils.error('發生未捕捉的例外 (uncaughtException):', err);
});

process.on('unhandledRejection', (reason) => {
  utils.error('發生未處理的 Promise 拒絕 (unhandledRejection):', reason);
});

const gracefulShutdown = (signal) => {
  utils.warn(`收到 ${signal} 訊號，準備關閉伺服器...`);
  if (heartbeatLogTimer) clearInterval(heartbeatLogTimer);
  if (wsPingInterval) clearInterval(wsPingInterval);
  if (wss) {
    wss.close(() => {
      utils.info('WebSocket伺服器已關閉。');
    });
  }
  server.close(() => {
    utils.info('REST API伺服器已關閉。');
    process.exit(0);
  });
  setTimeout(() => {
    utils.error('伺服器關閉逾時，強制結束程序。');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));