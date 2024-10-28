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

const log = function (...args) {
  if ((config.isDev || config.isDebug) && console.log) {
    console.log(...args);
  }
}

const warn = function (...args) {
  if (console.warn) {
    console.warn(...args);
  }
}

const error = function (...args) {
  if (console.error) {
    console.error(...args);
  }
}

const trim = (x) => {
  return typeof x === "string" ? x.replace(/^[\s\r\n]+|[\s\r\n]+$/gm, "") : "";
};

const timestamp = function (date = "time") {
  const now = new Date();
  const full =
    now.getFullYear() +
    "-" +
    ("0" + (now.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + now.getDate()).slice(-2) +
    " " +
    ("0" + now.getHours()).slice(-2) +
    ":" +
    ("0" + now.getMinutes()).slice(-2) +
    ":" +
    ("0" + now.getSeconds()).slice(-2);
  if (date === "full") {
    // e.g. 2021-03-14 16:03:00
    return full;
  } else if (date === "date") {
    return full.split(" ")[0];
  } else {
    // e.g. 16:03:00
    return full.split(" ")[1];
  }
};

const timestampToDate = function (ts) {
  const d = new Date(ts);
  return (
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getDate()).slice(-2) +
    " " +
    ("0" + d.getHours()).slice(-2) +
    ":" +
    ("0" + d.getMinutes()).slice(-2) +
    ":" +
    ("0" + d.getSeconds()).slice(-2)
  );
};

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
  // listen to message to wait response from worker
  worker?.on("message", (data) => {
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
  // post data to worker thread
  worker?.postMessage(params);
};

const packWSMessage = function (payload, opts = {}) {
  const args = {
    ...{
      type: 'SVR',
      id: '0',
      sender: process.env.SVR_NAME,
      date: timestamp('date'),
      time: timestamp('time'),
      message: payload,
      from: ip,
      channel: 'blackhole'
    },
    ...opts
  }
  if (typeof args.message === 'string') {
    args.message = trim(marked.parse(args.message, { sanitizer: DOMPurify.sanitize }))
    // markd generated message into <p>....</p>
    const innerText = args.message.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '')
    // test if the inner text contain HTML element
    if (!/<\/?[a-z][\s\S]*>/i.test(innerText)) {
      args.message = args.message.replace(/(?:\r\n|\r|\n)/g, '<br/>')
    }
  }
  return JSON.stringify(args)
}

module.exports = {
  ip,
  timestamp,
  timestampToDate,
  trim,
  sleep,
  isEmpty,
  authenticate,
  registerWorker,
  badRequest,
  runExecutable,
  runPowerShell,
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
  log,
  warn,
  error
};
