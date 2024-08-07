const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const __basename = path.basename(__filename);
const { parentPort } = require("worker_threads");
const { pathExistsSync, readdirSync, statSync } = require("fs-extra");
const si = require('systeminformation');
// const readLastLines = require('read-last-lines');

const url = `/${config.apiPrefix}/v1/l05`

parentPort.on("message", async (params) => {
  utils.log(`GET ${url} request`, params);
  let response = {
    statusCode: config.statusCode.FAIL,
    message: "❌ 未知的錯誤",
    payload: undefined
  };
  const payload = {
    ini: config.l05,
    loading: undefined,
    logs: undefined,
    runtimeLogs: {
      stdout: [],
      stderr: [],
      sqlnet: []
    },
    ping: -1,
    files: []
  };
  let message = "👌 繼續執行取得 L05 綜合分析資訊 ... ";
  utils.log(__basename, message);
  try {
    // #-1 fetching EXE logs (runtime log, last 100 lines)
    // message = "👉 取得 L05 執行期間紀錄檔 stdout.log ... ";
    // utils.log(__basename, message);
    // let tmp = await readLastLines.read(config.l05.logs.stdout, config.l05.logs.lines);
    // if (tmp.length > 0) {
    //   payload.runtimeLogs.stdout = [...tmp.split("\r\n")];
    // }
    // message = "👉 取得 L05 執行期間紀錄檔 stderr.log ... ";
    // utils.log(__basename, message);
    // tmp = await readLastLines.read(config.l05.logs.stderr, config.l05.logs.lines);
    // if (tmp.length > 0) {
    //   payload.runtimeLogs.stderr = [...tmp.split("\r\n")];
    // }
    // message = "👉 取得 L05 SQL連線紀錄檔 sqlnet.log ... ";
    // utils.log(__basename, message);
    // tmp = await readLastLines.read(config.l05.logs.sqlnet, config.l05.logs.lines);
    // if (tmp.length > 0) {
    //   payload.runtimeLogs.sqlnet = [...tmp.split("\r\n")];
    // }
    // #0 detect if remote server is available
    const remote = await utils.ping({
      host: config.l05.bureauSyncIp,
      port: config.l05.bureauSyncPort,
      timeout: 1000
    });
    // remote.time => response time
    payload.ping = remote.time
    if (!remote.success) {
      message = '🚩 局端伺服器無法連線';
      response.statusCode = config.statusCode.FAIL_NOT_REACHABLE;
    } else {
      // #1 collect process loading data
      const [ { proc, pid, pids, cpu, mem } ] = await si.processLoad(config.l05.processName);
      payload.loading = { proc, pid, pids, cpu, mem };
      if (!pathExistsSync(config.l05.localSyncPath)) {
        // #2 check if the sync dir exists
        message = '⚠️ 找不到同步異動檔案存放資料夾';
        response.statusCode = config.statusCode.FAIL_NOT_EXISTS;
      } else {
        response.statusCode = config.statusCode.SUCCESS;
        message = '✅ L05服務正常運作中';
        // #3 check pending files in sync folder
        const files = readdirSync(config.l05.localSyncPath);
        if (Array.isArray(files)) {
          files.forEach(file => {
            const stats = statSync(path.join(config.l05.localSyncPath, file));
            // only cares about file
            if (stats.isFile()) {
              stats.path = config.l05.localSyncPath;
              stats.name = file;
              payload.files.push(stats);
            }
          })
          if (!payload.loading.pid) {
            message = `(未偵測到同步程式 ${config.l05.processName}.exe)`;
          }
          // payload.files = [...files];
        }
        // getting MySQL logs
        try {
          // #1, #2, #3 are ok, #4 getting the latest 10(default) logs
          const limit = parseInt(params.limit) || 10;
          const db = require(path.join(config.rootPath, "model", "l05MySQL"));
          const [logs, dontcareFields] = await db.query(`SELECT * FROM qrysublog ORDER BY findate desc, fintime desc LIMIT ${limit}`) ;
          /**
           * checking today's latest log to see if the QryResult has "失敗"
           */
          const today = utils.timestamp('date').replaceAll('-', '');
          const failed = logs[0]?.FinDate === today && logs[0]?.QryResult?.includes('失敗');
          /**
           * put retrived logs into payload
           */
          payload.logs = logs;
          if (failed) {
            response.statusCode = config.statusCode.FAIL_SYNC_ERROR;
            message = '❌ 最新紀錄顯示失敗';
          }
        } catch (e) {
          // Ignoring any MySQL datatbase failures
          // if (e.code === 'ECONNREFUSED') {
          //   response.statusCode = config.statusCode.FAIL_NO_DATABASE;
          //   response.message = '⚠️ 無法連線 MySQL 取得 qrysublog 紀錄資料';
          // }
          utils.log(__basename, e);
        }
      }
    }
    // }
  } catch (e) {
    response.payload = e;
    console.error(__basename, "❌ 處理取得 L05 綜合分析資訊執行期間錯誤", e);
    response.message = "❌ 處理取得 L05 綜合分析資訊執行期間錯誤";
    response.statusCode = config.statusCode.FAIL;
  } finally {
    response.payload = payload;
    response.message = message;
    utils.log(__basename, response);
    parentPort.postMessage(response);
  }
});
