const { parentPort } = require("worker_threads");
const path = require("path");
const __basename = path.basename(__filename);
const md5 = require("md5");
const isEmpty = require("lodash/isEmpty");
const config = require(path.join(__dirname, "..", "..",  "model", "config"));
const MongoClient = require('mongodb').MongoClient;

parentPort.on("message", async (loginInfo) => {

  const data = { loggedIn: false, token: 'UNAUTHORIZED', message: "ç»å¥å¤±æ" };
  config.isDev && console.log(__basename, 'ð login worker è¨­å®åå§åæè³æ', data);

  const client = new MongoClient(config.connUri);
  try {
    await client.connect();
    config.isDev && console.log(__basename, 'â DBå·²é£ç·');
    const userCollection = client.db().collection(config.userCollection);
    const user = await userCollection.findOne({ id: loginInfo.userid });
    if (isEmpty(user)) {
      data.message = 'â ç»å¥å¤±æ(æ¾ä¸å°ä½¿ç¨è)';
      config.isDev && console.log(__basename, data.message, { id: loginInfo.userid });
    } else {
      config.isDev && console.log(__basename, 'â æ¾å°ä½¿ç¨èè³æ', user);
      const authority = parseInt(user.authority) || 0;
      if ((authority & 2) === 2) {
        data.message = 'â  å¸³æ¶å·²åç¨';
        config.isDev && console.log(__basename, data.message, { id: loginInfo.userid });
      } else if (user && user.pwd === md5(loginInfo.password)) {
        data.message = 'â ç»å¥æå';
        config.isDev && console.log(__basename, data.message);
        data.loggedIn = true;
        data.token = md5(+new Date() + loginInfo.userid);
        const token = {
          hash: data.token,
          expire: +new Date() + loginInfo.maxAge * 1000 //Date.now() milliseconds å¾®ç§æ¸
        };
        const result = await userCollection.updateOne({ id: loginInfo.userid }, { $set: { token: token } });
        config.isDev && console.log(__basename, `${loginInfo.userid} æä»¶å·²æ´æ°`, `æ¾å° ${result.matchedCount} åæä»¶, æ´æ° ${result.modifiedCount} åæä»¶`, token);
      } else {
        data.message = 'â ç»å¥å¤±æ(å¯ç¢¼ä¸å°)';
        config.isDev && console.log(__basename, data.message, { id: loginInfo.userid });
      }
    }
  } catch (e) {
    console.error(__basename, 'â èçç»å¥å·è¡æéé¯èª¤', e);
  } finally {
    parentPort.postMessage(data);
    await client.close();
  }
});
