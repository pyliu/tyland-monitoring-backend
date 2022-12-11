const path = require("path");
const isEmpty = require('lodash/isEmpty')
const __basename = path.basename(__filename);
const config = require(path.join(__dirname, "config"));
const HTTPStatusCodes = require("http-status-codes").StatusCodes;

const Cache = require('file-system-cache').default;
const fsCache = Cache({
  basePath: path.join(__dirname, "..", "assets", config.cachePath),
  ns: "tyland"
});

const trim = (x) => { return typeof x === 'string' ? x.replace(/^[\s\r\n]+|[\s\r\n]+$/gm, '') : '' }

const timestamp = function (date = 'time') {
  const now = new Date()
  const full = now.getFullYear() + '-' +
    ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
    ('0' + now.getDate()).slice(-2) + ' ' +
    ('0' + now.getHours()).slice(-2) + ':' +
    ('0' + now.getMinutes()).slice(-2) + ':' +
    ('0' + now.getSeconds()).slice(-2)
  if (date === 'full') {
    // e.g. 2021-03-14 16:03:00
    return full
  } else if (date === 'date') {
    return full.split(' ')[0]
  } else {
    // e.g. 16:03:00
    return full.split(' ')[1]
  }
}

const timestampToDate = function (ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
    ('0' + d.getDate()).slice(-2) + ' ' +
    ('0' + d.getHours()).slice(-2) + ':' +
    ('0' + d.getMinutes()).slice(-2) + ':' +
    ('0' + d.getSeconds()).slice(-2)
}

const sleep = function (ms = 0) {
  return new Promise(r => setTimeout(r, ms))
}

const authenticate = async function (authHeader) {
  return true;
  if (isEmpty(authHeader) || !authHeader.startsWith("Bearer ")) {
    config.isDev && console.warn('⚠ 找不到 Authorization 表頭', authHeader);
    return false;
  }
  // const hash = authHeader.replace("Bearer ", "");
  try {
    // await client.connect();
    // config.isDev && console.log(__basename, "✔ DB已連線");
    // const userCollection = client.db().collection(config.userCollection);
    // const tokenFilter = { "token.hash": hash };
    // const user = await userCollection.findOne(tokenFilter);
    // if (isEmpty(user)) {
    //   return false;
    // } else {
    //   const authority = parseInt(user.authority) || 0;
    //   if ((authority & 2) === 2) {
    //     data.message = '⚠ 帳戶已停用';
    //     config.isDev && console.log(__basename, "🔴 ⚠ 帳戶已停用!", user.id, user.name);
    //     return false;
    //   }
    //   config.isDev && console.log(__basename, "🔎 檢查 token 是否已過期", hash);
    //   const expire = user.token.expire;
    //   config.isDev && console.log(__basename, "❗ token 預計過期時間", timestampToDate(expire));
    //   const now = +new Date();
    //   if (now > expire) {
    //     config.isDev && console.log(__basename, "🔴 token 已過期，需重新登入!", hash);
    //     return false
    //   }
    //   config.isDev && console.log(__basename, `🟢 ${user.id} token(${hash}) 正常`);
    //   return true;
    // }
  } catch (e) {
    console.error(e);
  } finally {
  }
  return false;
}

const badRequest = function (res, message, statusCode) {
  res && res.status(HTTPStatusCodes.BAD_REQUEST).send({
    statusCode: statusCode ? statusCode : config.statusCode.FAIL,
    message: message ? message : "❌ 連線伺服器失敗"
  });
}

module.exports = {
  timestamp,
  timestampToDate,
  trim,
  sleep,
  isEmpty,
  authenticate,
  badRequest,
  cache: {
    get: function (key) {
      let data = undefined;
      try {
        data = fsCache.getSync(key, undefined);
        if (data) {
          const now = Date.now(); // in ms
          const parsed = JSON.parse(data);
          if (parsed) {
            const expired = parseInt(parsed.expired);
            if (expired === -1 || now - expired < 0) {
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
          expired: expireVal > 0 ? now + expireVal : -1,
          data: val
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
    }
  }
}
