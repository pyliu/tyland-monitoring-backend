const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");

const url = `/${config.apiPrefix}/v1/l05/:findate`

parentPort.on("message", async (params) => {
  config.isDev && console.log(`GET ${url} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    config.isDev && console.log(__basename, `👌 繼續執行取得 ${params.date} L05 同步異動同步異動資訊 ... `);
    const db = require(path.join(config.rootPath, "model", "l05MySQL"));
    const [result, fields] = await db.query(`SELECT * FROM qrysublog WHERE findate = '${params.date}' ORDER BY findate desc, qryid desc`) ;
    const message = `🟢 找到 ${params.date} L05 ${result.length} 筆同步異動紀錄`;
    config.isDev && console.log(__basename, message, result);
    response.statusCode = config.statusCode.SUCCESS;
    response.message = message;
    /**
     * put retrived result into payload
     */
    response.payload = result;
    // }
  } catch (e) {
    console.error(__basename, `❗ 處理取得 ${params.date} L05 同步異動紀錄資訊執行期間錯誤`, e);
    response.payload = e;
  } finally {
    parentPort.postMessage(response);
  }
});
