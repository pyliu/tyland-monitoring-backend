const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const utils = require(path.join(__dirname, "..", "..", "..", "..", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

const url = `/${config.apiPrefix}/v1/loading/process`
const workerName = 'Process Loading';

parentPort.on("message", async (params) => {
  (config.isDev || config.isDebug) && console.log(`GET ${url}/${params.process_name} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    (config.isDev || config.isDebug) && console.log(__basename, `👌 繼續執行取得 ${workerName} (${params.process_name}) 資訊 ... `);
    if (utils.isEmpty(params.process_name)) {
      response.message = '需指定 Process 的名稱'
    } else {
      const data = await si.processLoad(params.process_name);
      const message = `🟢 找到 ${workerName} (${params.process_name}) 資料`;
      (config.isDev || config.isDebug) && console.log(__basename, message, data);
      response.statusCode = config.statusCode.SUCCESS;
      response.message = message;
      /**
       * put retrived processes loading data into payload
       */
      response.payload = data;
    }
  } catch (e) {
    console.error(__basename, `❗ 處理取得 ${workerName} (${params.process_name}) 資訊執行期間錯誤`, e);
    response.payload = e;
  } finally {
    parentPort.postMessage(response);
  }
});
