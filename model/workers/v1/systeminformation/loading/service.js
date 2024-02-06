const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const si = require('systeminformation');

const url = `/${config.apiPrefix}/v1/loading/service`
const workerName = 'Service Loading';

parentPort.on("message", async (params) => {
  utils.log(`GET ${url}/${params.service_name} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    utils.log(__basename, `👌 繼續執行取得 ${workerName} (${params.service_name}) 資訊 ... `);
    if (utils.isEmpty(params.service_name)) {
      response.message = '需指定 Service 的名稱'
    } else {
      const data = await si.services(params.service_name);
      const message = `🟢 找到 ${workerName} (${params.service_name}) 資料`;
      utils.log(__basename, message, data);
      response.statusCode = config.statusCode.SUCCESS;
      response.message = message;
      /**
       * put retrived processes loading data into payload
       */
      response.payload = data;
    }
  } catch (e) {
    console.error(__basename, `❗ 處理取得 ${workerName} (${params.service_name}) 資訊執行期間錯誤`, e);
    response.payload = e;
  } finally {
    parentPort.postMessage(response);
  }
});
