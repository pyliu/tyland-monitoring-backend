const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..",  "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  // get log content by request
  app.get(`/${config.apiPrefix}/v1/log`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'log', 'index.js'));
      utils.registerWorker(res, worker, {
        // log count limit
        limit: req.query?.limit
      });
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
    // TODO: parse path and read it
  });
}
