const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

const url = `/${config.apiPrefix}/v1/processes`
const workerName = 'PROCESSES';

parentPort.on("message", async (params) => {
  utils.log(`GET ${url} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };

  utils.log(__basename, `👌 利用 systeminformation 取得 ${workerName} 資訊 ... `);
  si.processes().then((data) => {
    const message = `🟢 ${workerName} 資料已收集`;
    utils.log(__basename, message, data);
    response.statusCode = config.statusCode.SUCCESS;
    response.message = message;
    /**
     * put retrived processes data into payload
     */
    response.payload = data;
    // }
  }).catch((e) => {
    console.error(__basename, `❗ 處理取得 ${workerName} 資訊執行期間錯誤`, e);
    response.payload = e;
  }).finally(() => {
    parentPort.postMessage(response);
  })
});
