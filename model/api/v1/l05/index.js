const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..",  "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  app.get(`/${config.apiPrefix}/v1/l05`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'l05', 'index.js'));
      utils.registerWorker(res, worker, {
        limit: req.query?.limit
      });
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/l05/:findate`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'l05', 'findate.js'));
      utils.registerWorker(res, worker, {
        date: req.params?.findate
      });
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
