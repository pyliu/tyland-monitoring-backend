const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

parentPort.on("message", async (postBody) => {
  config.isDev && console.log(`GET /${config.apiPrefix}/v1/hardware request`, postBody);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    config.isDev && console.log(__basename, "👌 繼續執行取得 Hardware 資訊 ... ");
    const data = await si.system();
    const message = `🟢 找到 Hardware 資料`;
    config.isDev && console.log(__basename, message, data);
    response.statusCode = config.statusCode.SUCCESS;
    response.message = message;
    /**
     * put retrived hardware data into payload
     */
    response.payload = data;
    // }
  } catch (e) {
    console.error(__basename, "❗ 處理取得 Hardware 資訊執行期間錯誤", e);
    response.payload = e;
  } finally {
    parentPort.postMessage(response);
  }
});
