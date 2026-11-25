const path = require("path");
const isEmpty = require("lodash/isEmpty");
// const __basename = path.basename(__filename);
const config = require(path.join(__dirname, "config"));
const { ping } = require('tcp-ping-node');
const { spawn } = require("child_process");
const HTTPStatusCodes = require("http-status-codes").StatusCodes;
const shell = require('node-powershell');

const Cache = require("file-system-cache").default;
const fsCache = Cache({
  basePath: path.join(__dirname, "..", "assets", config.cachePath),
  ns: "tyland",
});
/**
 * collect OS network interface info
 */
const os = require('os');
const networkInterfaces = os.networkInterfaces();
const ips = [];
for (const name of Object.keys(networkInterfaces)) {
  for (const net of networkInterfaces[name]) {
    // only IPv4 and starts with '220.1.' or '192.168.'
    if (net.family === 'IPv4' && (net.address?.startsWith('220.1.') || net.address?.startsWith('192.168.'))) {
      ips.push(net.address);
    }
  }
}
const ip = ips.length > 0 ? ips[ips.length - 1] : 'N/A';
(config.isDev || config.isDebug) && console.log && console.log('Found IPs', ips, 'Choosed the last one', ip);
/**
 * 
 * @param {string} pathORcommand - a file path, e.g. XXXX.ps1, OR a command, e.g. 'Get-Process'
 * @param {*} args - parameters for the command
 * @returns 
 */
async function runPowerShell(pathORcommand, args = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      ...{
        executionPolicy: 'Bypass',
        noProfile: true
      },
      ...args
    }
    const ps = new shell(opts);
    ps.addCommand(pathORcommand);
    ps.invoke()
    .then(output => {
      console.log(output);
      resolve(output);
    })
    .catch(err => {
      console.log(err);
      ps.dispose();
      reject(err);
    });
  });
}
/**
 * @param {string} executable
 * @param {string[]} args
 * @param {import('child_process').SpawnOptions} opts
 * @return {Promise<number>} return code
 * 
example:
try {
    const code = await run('powershell', ["-executionpolicy", "unrestricted", "-file", 'script.ps1']);
    process.exit(code);
} catch (e) {
    console.error(e);
    process.exit(e.code || 1);
}
 * */
async function runExecutable(executable, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      shell: true,
      stdio: ["pipe", process.stdout, process.stderr],
      ...opts,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        const e = new Error("Process exited with error code " + code);
        e.code = code;
        reject(e);
      }
    });
  });
}

const trim = (x) => {
  return typeof x === "string" ? x.replace(/^[\s\r\n]+|[\s\r\n]+$/gm, "") : "";
};

const timestamp = function (date = "time", showMs = true) {
  const now = new Date();

  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  // Extract hours, minutes, seconds, and milliseconds
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

  // e.g. 2024-10-29 10:40:00.123
  const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${showMs ? `.${milliseconds}` : ''}`
  if (date === "full") {
    return formatted;
  } else if (date === "date") {
    return formatted.split(" ")[0];
  } else {
    // e.g. 16:03:00.123
    return formatted.split(" ")[1];
  }
};

const formatLogArgs = function (level, args) {
  const prefix = `[${level}]`;
  return config.printTSLog ? [timestamp(), prefix, ...args] : [prefix, ...args];
};

const info = function (...args) {
  if (console.log) {
    console.log(...formatLogArgs("INFO", args));
  }
};

const log = function (...args) {
  if ((config.isDev || config.isDebug) && console.log) {
    console.log(...formatLogArgs("DEBUG", args));
  }
}

const warn = function (...args) {
  if (console.warn) {
    console.warn(...formatLogArgs("WARN", args));
  }
}

const error = function (...args) {
  if (console.error) {
    console.error(...formatLogArgs("ERROR", args));
  }
}

const sleep = function (ms = 0) {
  return new Promise((r) => setTimeout(r, ms));
};

const authenticate = async function (authHeader) {
  return true;
  if (isEmpty(authHeader) || !authHeader.startsWith("Bearer ")) {
    (config.isDev || config.isDebug) && console.warn("⚠ 找不到 Authorization 表頭", authHeader);
    return false;
  }
  // const hash = authHeader.replace("Bearer ", "");
  try {
    // await client.connect();
    // log(__basename, "✔ DB已連線");
    // const userCollection = client.db().collection(config.userCollection);
    // const tokenFilter = { "token.hash": hash };
    // const user = await userCollection.findOne(tokenFilter);
    // if (isEmpty(user)) {
    //   return false;
    // } else {
    //   const authority = parseInt(user.authority) || 0;
    //   if ((authority & 2) === 2) {
    //     data.message = '⚠ 帳戶已停用';
    //     log(__basename, "🔴 ⚠ 帳戶已停用!", user.id, user.name);
    //     return false;
    //   }
    //   log(__basename, "🔎 檢查 token 是否已過期", hash);
    //   const expire = user.token.expire;
    //   log(__basename, "❗ token 預計過期時間", timestampToDate(expire));
    //   const now = +new Date();
    //   if (now > expire) {
    //     log(__basename, "🔴 token 已過期，需重新登入!", hash);
    //     return false
    //   }
    //   log(__basename, `🟢 ${user.id} token(${hash}) 正常`);
    //   return true;
    // }
  } catch (e) {
    console.error(e);
  } finally {
  }
  return false;
};

const badRequest = function (res, message, statusCode) {
  res &&
    res.status(HTTPStatusCodes.BAD_REQUEST).send({
      statusCode: statusCode ? statusCode : config.statusCode.FAIL,
      message: message ? message : "❌ 連線伺服器失敗",
    });
};

const registerWorker = function (res, worker, params = {}) {
  const startTime = Date.now();
  let settled = false;

  // listen to message to wait response from worker
  worker?.on("message", (data) => {
    if (settled) return;
    settled = true;
    log(`Worker 回應完成 (${Date.now() - startTime}ms), statusCode=${data?.statusCode}`);
    res
      .status(
        // data.statusCode <= config.statusCode.FAIL
        //   ? HTTPStatusCodes.NOT_ACCEPTABLE
        //   : HTTPStatusCodes.OK
        // always response OK to let FE receives the data by axios 
        HTTPStatusCodes.OK
      )
      .send({ ...data });
  });

  worker?.on("error", (err) => {
    error("Worker 執行發生未捕捉錯誤:", err);
    if (!settled && res && !res.headersSent) {
      settled = true;
      res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).send({
        statusCode: config.statusCode.FAIL,
        message: "❌ 背景工作執行失敗",
        payload: err?.message || String(err)
      });
    }
  });

  worker?.on("exit", (code) => {
    if (code !== 0 && !settled) {
      error(`Worker 異常結束，exit code=${code} (${Date.now() - startTime}ms)`);
      if (res && !res.headersSent) {
        settled = true;
        res.status(HTTPStatusCodes.INTERNAL_SERVER_ERROR).send({
          statusCode: config.statusCode.FAIL,
          message: `❌ 背景工作異常結束 (code: ${code})`
        });
      }
    }
  });

  // post data to worker thread
  worker?.postMessage(params);
};

const packWsData = function (json) {
  const tmp = {
    success: false,
    ...json
  }
  return JSON.stringify(tmp)
}

module.exports = {
  ip,
  timestamp,
  trim,
  sleep,
  isEmpty,
  authenticate,
  registerWorker,
  badRequest,
  runExecutable,
  runPowerShell,
  packWsData,
  cache: {
    get: function (key) {
      let data = undefined;
      try {
        const cached = fsCache.getSync(key, undefined);
        if (typeof cached === "string") {
          const now = Date.now(); // in ms
          const parsed = JSON.parse(cached);
          if (typeof parsed === "object") {
            if (parsed.expired < 1 || parsed.expired - now > 0) {
              data = parsed.data;
            } else {
              fsCache.remove(key);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        return data;
      }
    },
    set: function (key, val, expire) {
      let result = false;
      try {
        const now = Date.now(); // in ms
        const expireVal = parseInt(expire);
        const json = {
          expired: expireVal > 0 ? now + expireVal : 0,
          data: val,
        };
        fsCache.setSync(key, JSON.stringify(json));
        result = true;
      } catch (e) {
        console.error(e);
      } finally {
        return result;
      }
    },
    remove: async function (key) {
      let result = false;
      try {
        await fsCache.remove(key);
        result = true;
      } catch (e) {
        console.error(e);
      } finally {
        return result;
      }
    },
  },
  ping,
  info,
  log,
  warn,
  error
};
