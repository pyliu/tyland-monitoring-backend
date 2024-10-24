const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const { pathExistsSync, readFileSync } = require("fs-extra");
const iconv = require('iconv-lite');

const url = `/${config.apiPrefix}/v1/log`

parentPort.on("message", async (params) => {
  utils.log(`POST ${url} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "❌ 未知的錯誤",
    payload: undefined
  };
  let message = "👌 繼續執行取得LOG檔案 ... ";
  utils.log(__basename, message);
  const payload = {
    raw: '',
    path: params.path,
    encoding: params.encoding || 'UTF8'
  };
  try {
      const logPath = payload.path
      const encoding = payload.encoding
      if (pathExistsSync(logPath)) {
        message = `👉 ${logPath} 存在，繼續以 ${encoding} 格式讀取檔案內容 ... `;
        utils.log(__basename, message);
        const fileBuffer = readFileSync(logPath);
        payload.raw = iconv.decode(fileBuffer, encoding);
        message = `✔ 讀取 ${logPath} 成功。`;
        utils.log(__basename, message);
      } else {
        message = `⚠ ${logPath} 不存在！`;
        response.statusCode = config.statusCode.FAIL_NOT_FOUND;
      }
  } catch (e) {
    response.payload = e;
    console.error(__basename, "❌ 處理取得LOG紀錄請求執行期間錯誤", e);
    response.message = "❌ 處理取得LOG紀錄請求執行期間錯誤";
    response.statusCode = config.statusCode.FAIL;
  } finally {
    response.payload = payload;
    response.message = message;
    utils.log(__basename, response);
    parentPort.postMessage(response);
  }
});
