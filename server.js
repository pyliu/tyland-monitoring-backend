require('dotenv').config()
const config = require('./model/config');
const utils = require('./model/utils');
const compression = require("compression");
const express = require("express");
const https = require('https');
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");

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
  * SystemInformation API
  */
const l05API = require(`./model/api/${config.apiVersion}/l05/index`);
l05API.register(app);
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
app.listen(SERVER_PORT, () => {
  console.log(`伺服器已於 ${SERVER_PORT} 埠號啟動。`);
});
