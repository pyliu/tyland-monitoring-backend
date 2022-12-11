const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(__dirname, "..", "..", "..", "utils"));
const StatusCodes = require("http-status-codes").StatusCodes;
const { Worker } = require("worker_threads");

const subscribe = function (res, worker, params = {}) {
  // listen to message to wait response from worker
  worker?.on("message", (data) => {
    res.status(data.statusCode === config.statusCode.FAIL ? StatusCodes.NOT_ACCEPTABLE : StatusCodes.OK).send({ ...data });
  });
  // post data to worker thread
  worker?.postMessage(params);
}

module.exports.register = (app) => {
  app.get(`/${config.apiPrefix}/v1/cpu`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(__dirname, '..', '..', '..', 'workers', 'v1', 'systeminformation', 'cpu', 'default.js'));
      subscribe(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/cpu/flags`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(__dirname, '..', '..', '..', 'workers', 'v1', 'systeminformation', 'cpu', 'flags.js'));
      subscribe(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/cpu/cache`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(__dirname, '..', '..', '..', 'workers', 'v1', 'systeminformation', 'cpu', 'cache.js'));
      subscribe(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/cpu/speed`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(__dirname, '..', '..', '..', 'workers', 'v1', 'systeminformation', 'cpu', 'speed.js'));
      subscribe(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
  app.get(`/${config.apiPrefix}/v1/cpu/temperature`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(__dirname, '..', '..', '..', 'workers', 'v1', 'systeminformation', 'cpu', 'temperature.js'));
      subscribe(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
