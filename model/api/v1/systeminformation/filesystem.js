const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(config.rootPath, "model", "utils"));
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  app.get(`/${config.apiPrefix}/v1/filesystem`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'filesystem', 'default.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/filesystem/disks`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'filesystem', 'disksLayout.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/filesystem/disks/io`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'filesystem', 'disksIO.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/filesystem/blocks`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'filesystem', 'blockDevices.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/filesystem/openfiles`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'filesystem', 'openFiles.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/filesystem/stats`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(config.rootPath, 'model', 'workers', 'v1', 'systeminformation', 'filesystem', 'stats.js'));
      utils.registerWorker(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
