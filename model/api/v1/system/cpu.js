const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(__dirname, "..", "..", "..", "utils"));
const StatusCodes = require("http-status-codes").StatusCodes;
const { Worker } = require("worker_threads");

module.exports.register = (app) => {
  app.get(`/${config.apiPrefix}/v1/cpu`, (req, res) => {
    if (utils.authenticate(req.headers.authorization)) {
      const worker = new Worker(path.join(__dirname, 'workers', 'getCPUs.js'));
      // listen to message to wait response from worker
      worker.on("message", (data) => {
        res.status(data.statusCode === config.statusCode.FAIL ? StatusCodes.NOT_ACCEPTABLE : StatusCodes.OK).send({ ...data });
      });
      // post data to worker thread
      // worker.postMessage({ site_code: req.params.site_code });
      worker.postMessage({});
    } else {
      utils.badRequest(req, "❌ 認證失敗");
    }
  });
}
