const { parentPort } = require("worker_threads");
const path = require("path");
const __basename = path.basename(__filename);
const md5 = require("md5");
const isEmpty = require("lodash/isEmpty");
const config = require(path.join(__dirname, "..", "..",  "model", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const MongoClient = require('mongodb').MongoClient;

parentPort.on("message", async (loginInfo) => {

  const data = { loggedIn: false, token: 'UNAUTHORIZED', message: "登入失敗" };
  utils.log(__basename, '👉 login worker 設定初始回應資料', data);

  const client = new MongoClient(config.connUri);
  try {
    await client.connect();
    utils.log(__basename, '✔ DB已連線');
    const userCollection = client.db().collection(config.userCollection);
    const user = await userCollection.findOne({ id: loginInfo.userid });
    if (isEmpty(user)) {
      data.message = '❌ 登入失敗(找不到使用者)';
      utils.log(__basename, data.message, { id: loginInfo.userid });
    } else {
      utils.log(__basename, '✔ 找到使用者資料', user);
      const authority = parseInt(user.authority) || 0;
      if ((authority & 2) === 2) {
        data.message = '⚠ 帳戶已停用';
        utils.log(__basename, data.message, { id: loginInfo.userid });
      } else if (user && user.pwd === md5(loginInfo.password)) {
        data.message = '✔ 登入成功';
        utils.log(__basename, data.message);
        data.loggedIn = true;
        data.token = md5(+new Date() + loginInfo.userid);
        const token = {
          hash: data.token,
          expire: +new Date() + loginInfo.maxAge * 1000 //Date.now() milliseconds 微秒數
        };
        const result = await userCollection.updateOne({ id: loginInfo.userid }, { $set: { token: token } });
        utils.log(__basename, `${loginInfo.userid} 文件已更新`, `找到 ${result.matchedCount} 個文件, 更新 ${result.modifiedCount} 個文件`, token);
      } else {
        data.message = '❌ 登入失敗(密碼不對)';
        utils.log(__basename, data.message, { id: loginInfo.userid });
      }
    }
  } catch (e) {
    console.error(__basename, '❗ 處理登入執行期間錯誤', e);
  } finally {
    parentPort.postMessage(data);
    await client.close();
  }
});
