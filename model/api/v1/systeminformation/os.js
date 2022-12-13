const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  app.get(`/${config.apiPrefix}/v1/os`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'os', 'default.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/os/shell`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'os', 'shell.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/os/versions`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'os', 'versions.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/os/users`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'os', 'users.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
