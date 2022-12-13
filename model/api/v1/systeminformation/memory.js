const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  app.get(`/${config.apiPrefix}/v1/memory`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'memory', 'default.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/memory/layout`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'memory', 'layout.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
