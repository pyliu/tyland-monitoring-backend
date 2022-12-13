const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  app.get(`/${config.apiPrefix}/v1/loading`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'loading', 'current.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/loading/current`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'loading', 'current.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/loading/full`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'loading', 'full.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/loading/process/:process_name`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'loading', 'process.js'));
      utils.registerWorker(res, worker, {
        process_name: req.params.process_name
      });
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/loading/service/:service_name`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'loading', 'service.js'));
      utils.registerWorker(res, worker, {
        service_name: req.params.service_name
      });
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
