const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const utils = require(path.join(__dirname, "..", "..", "..", "..", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

const workerName = "Hardware Chassis";
const url = `/${config.apiPrefix}/v1/hardware/chassis`;

parentPort.on("message", async (postBody) => {
  (config.isDev || config.isDebug) && console.log(`GET /${config.apiPrefix}/v1/hardware/chassis request`, postBody);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    (config.isDev || config.isDebug) && console.log(__basename, `👌 繼續執行取得 ${workerName} 資訊 ... `);
    let data = utils.cache.get(url);
    if (!data) {
      data = await si.chassis();
      // cache data forever
      utils.cache.set(url, data, 0);
    }
    const message = `🟢 找到 ${workerName} 資料`;
    (config.isDev || config.isDebug) && console.log(__basename, message, data);
    response.statusCode = config.statusCode.SUCCESS;
    response.message = message;
    /**
     * put retrived hardware chassis data into payload
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
