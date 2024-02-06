const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

const url = `/${config.apiPrefix}/v1/network/check`
const workerName = 'NETWORK CHECK';

parentPort.on("message", async (params) => {
  utils.log(`GET ${url} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    utils.log(__basename, `👌 繼續執行取得 ${workerName} ${params.target} 資訊 ... `);
    const target = params.target || '8.8.8.8';
    let data = await si.inetChecksite(target);
    if (utils.isEmpty(data.ms)) {
      const ping = require('ping');
      const tmp = await ping.promise.probe(target);
      if (tmp.alive) {
        data.ok = tmp.alive;
        data.url = tmp.host;
        data.ip = tmp.numeric_host;
        data.ms = tmp.time;
        data.status = 200;
        data.raw = tmp;
      }
    }
    const message = `🟢 找到 ${workerName} 資料`;
    utils.log(__basename, message, data);
    response.statusCode = config.statusCode.SUCCESS;
    response.message = message;
    /**
     * put retrived network checking data into payload
     */
    response.payload = data;
    // }
  } catch (e) {
    console.error(__basename, `❗ 處理取得 ${workerName} ${params.target} 資訊執行期間錯誤`, e);
    response.payload = e;
  } finally {
    parentPort.postMessage(response);
  }
});
