const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const { pathExistsSync } = require("fs-extra");
const si = require('systeminformation');

const url = `/${config.apiPrefix}/v1/l05`

parentPort.on("message", async (params) => {
  config.isDev && console.log(`GET ${url} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "未知的錯誤",
    payload: undefined
  };
  try {
    let message = "👌 繼續執行取得 L05 綜合分析資訊 ... ";
    config.isDev && console.log(__basename, message);
    // #1 check if the process is running
    const [ { proc, pid, pids, cpu, mem } ] = await si.processLoad(config.l05ProcessName);
    if (!parseInt(pid)) {
      message = '同步程式尚未執行';
      response.statusCode = config.statusCode.FAIL_NOT_RUNNING;
      response.payload = { proc, pid, pids, cpu, mem };
    } else if (!pathExistsSync(config.l05BuildtsPath)) {
      // #2 check if the sync dir exists
      message = '找不到同步異動檔案存放資料夾';
      response.statusCode = config.statusCode.FAIL_NOT_EXISTS;
      response.payload = config.l05BuildtsPath;
    } else {
      // #1, #2 are ok, #3 getting the latest 10(default) logs
      const limit = parseInt(params.limit) || 10;
      const db = require(path.join(config.rootPath, "model", "l05MySQL"));
      const [result, dontcareFields] = await db.query(`SELECT * FROM qrysublog ORDER BY findate desc, qryid desc LIMIT ${limit}`) ;
      message = '🟢 L05服務正常運作中';
      /**
       * put retrived logs into payload
       */
      response.payload = result;
      response.statusCode = config.statusCode.SUCCESS;
    }
    response.message = message;
    config.isDev && console.log(__basename, response);
    // }
  } catch (e) {
    response.payload = e;
    if (e.code === 'ECONNREFUSED') {
      response.statusCode = config.statusCode.FAIL_NO_MYSQL;
      response.message = '無法連線 MySQL 取得 qrysublog 紀錄資料';
    } else {
      console.error(__basename, "❌ 處理取得 L05 綜合分析資訊執行期間錯誤", e);
      response.message = "❌ 處理取得 L05 綜合分析資訊執行期間錯誤";
      response.statusCode = config.statusCode.FAIL;
    }
    config.isDev && console.log(__basename, response);
  } finally {
    parentPort.postMessage(response);
  }
});
