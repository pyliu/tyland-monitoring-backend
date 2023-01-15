const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..",  "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  // get L05 overall status
  app.get(`/${config.apiPrefix}/v1/l05`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'l05', 'index.js'));
      utils.registerWorker(res, worker, {
        // log count limit
        limit: req.query?.limit
      });
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  // get L05 recent logs
  app.get(`/${config.apiPrefix}/v1/l05/log`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'l05', 'log', 'index.js'));
      utils.registerWorker(res, worker, {
        limit: req.query?.limit
      });
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  // get L05 logs by day
  app.get(`/${config.apiPrefix}/v1/l05/log/:findate`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'l05', 'log', 'findate.js'));
      utils.registerWorker(res, worker, {
        date: req.params?.findate
      });
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
