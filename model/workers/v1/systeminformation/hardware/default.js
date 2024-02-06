const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const utils = require(path.join(__dirname, "..", "..", "..", "..", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

const workerName = 'Hardware';
const url = `/${config.apiPrefix}/v1/hardware`;

parentPort.on("message", async (postBody) => {
  (config.isDev || config.isDebug) && console.log(`GET ${url} request`, postBody);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    (config.isDev || config.isDebug) && console.log(__basename, `👌 繼續執行取得 ${workerName} 資訊 ... `);
    let data = utils.cache.get(url);
    if (!data) {
      data = await si.system();
      // cache data for a month
      utils.cache.set(url, data, 30 * 24 * 60 * 60 * 1000);
    }
    const message = `🟢 找到 ${workerName} 資料`;
    (config.isDev || config.isDebug) && console.log(__basename, message, data);
    response.statusCode = config.statusCode.SUCCESS;
    response.message = message;
    /**
     * put retrived hardware data into payload
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
