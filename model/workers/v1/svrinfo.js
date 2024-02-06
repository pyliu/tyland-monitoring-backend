const path = require("path");
const config = require(path.join(__dirname, "..", "..", "config"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

const url = `/${config.apiPrefix}/v1/svrinfo`

parentPort.on("message", async (params) => {
  (config.isDev || config.isDebug) && console.log(`GET ${url} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    let message = "👌 繼續執行取得 svrinfo 資訊 ... ";
    (config.isDev || config.isDebug) && console.log(__basename, message);
    const payload = {
      name: config.svrName,
      desc: config.svrDesc
    };
    response.payload = payload;
    response.message = '已取得伺服器資訊';
    response.statusCode = config.statusCode.SUCCESS;
    (config.isDev || config.isDebug) && console.log(__basename, response);
    // }
  } catch (e) {
    console.error(__basename, "❌ 處理取得 svrinfo 資訊執行期間錯誤", e);
    response.payload = e;
    response.message = "❌ 處理取得 svrinfo 資訊執行期間錯誤";
    response.statusCode = config.statusCode.FAIL;
    (config.isDev || config.isDebug) && console.log(__basename, response);
  } finally {
    parentPort.postMessage(response);
  }
});
