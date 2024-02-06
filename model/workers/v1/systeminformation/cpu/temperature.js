const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

parentPort.on("message", async (postBody) => {
  (config.isDev || config.isDebug) && console.log(`GET /${config.apiPrefix}/v1/cpu/temperature request`, postBody);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    (config.isDev || config.isDebug) && console.log(__basename, "👌 繼續執行取得 CPU Temperature 資訊 ... ");
    const temperature = await si.cpuTemperature();
    const message = `🟢 找到 CPU Temperature 資料`;
    (config.isDev || config.isDebug) && console.log(__basename, message, temperature);
    response.statusCode = config.statusCode.SUCCESS;
    response.message = message;
    /**
     * put retrived cpu Temperature data into payload
     */
    response.payload = temperature;
    // }
  } catch (e) {
    console.error(__basename, "❗ 處理取得 CPU Temperature 資訊執行期間錯誤", e);
    response.payload = e;
  } finally {
    parentPort.postMessage(response);
  }
});
