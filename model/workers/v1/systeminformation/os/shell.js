const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const utils = require(path.join(__dirname, "..", "..", "..", "..", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

const url = `/${config.apiPrefix}/v1/os/shell`
const workerName = 'OS Shell';

parentPort.on("message", async (postBody) => {
  (config.isDev || config.isDebug) && console.log(`GET ${url} request`, postBody);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    (config.isDev || config.isDebug) && console.log(__basename, `👌 繼續執行取得 ${workerName} 資訊 ... `);
    const data = await si.shell();
    const message = `🟢 找到 ${workerName} 資料`;
    (config.isDev || config.isDebug) && console.log(__basename, message, data);
    response.statusCode = config.statusCode.SUCCESS;
    response.message = message;
    /**
     * put retrived os shell data into payload
     */
    response.payload = data;
    // }
  } catch (e) {
    console.error(__basename, `❗ 處理取得 ${workerName} 資訊執行期間錯誤`, e);
    response.payload = e;
  } finally {
    parentPort.postMessage(response);
  }
});
