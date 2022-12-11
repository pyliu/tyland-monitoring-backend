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
  app.get(`/${config.apiPrefix}/v1/general/static`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(__dirname, '..', '..', '..', 'workers', 'v1', 'systeminformation', 'general', 'static.js'));
      subscribe(res, worker);
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
