const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..",  "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  // get log content by request
  app.post(`/${config.apiPrefix}/v1/log`, (req, res) => {
    /**
     * req.body: 包含了從請求的 body 中解析出來的資料，通常是表單提交的資料或 JSON 格式的資料。
     * req.params: 包含了 URL 中動態的部分，也就是路徑參數。
     * req.query: 包含了 URL 中查詢字串的部分。
     * req.headers: 包含了請求頭的資訊。
     */
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'log', 'index.js'));
      // expect req.body has path param
      utils.registerWorker(res, worker, req.body);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
    // TODO: parse path and read it
  });
}
