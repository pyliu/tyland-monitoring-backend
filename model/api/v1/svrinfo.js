const path = require("path");
const config = require(path.join(__dirname, "..", "..",  "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  // get L05 overall status
  app.get(`/${config.apiPrefix}/v1/svrinfo`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'svrinfo.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
