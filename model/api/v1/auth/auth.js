const path = require("path");
const config = require(path.join(__dirname, "..", "..", "..", "config"));
const utils = require(path.join(__dirname, "..", "..", "..", "utils"));
const StatusCodes = require("http-status-codes").StatusCodes;
const { Worker } = require("worker_threads");
const { isEmpty } = require("lodash");

module.exports.register = (app) => {

  app.post("/login", (req, res) => {
    const postBody = req.body
    (config.isDev || config.isDebug) && console.log('👉 收到 Login 請求', postBody);
    if (isEmpty(postBody.apiKey) ) {
      console.warn('登入 apiKey 為空值。', postBody)
      utils.badRequest(req, "❌ 認證失敗");
    } else {
      const worker = new Worker(path.join(__dirname, '..', '..', '..', 'workers', 'v1', 'auth', 'default.js'));
      // listen to message to wait response from worker
      worker.on("message", (data) => {
        res.status(data.loggedIn ? StatusCodes.OK : StatusCodes.UNAUTHORIZED).send({
          token: data.token
        });
      });
      // send data to worker
      worker.postMessage(postBody);
    }
  });
  
  // app.post("/logout", (req, res) => {
  //   if (utils.authenticate(req.headers.authorization)) {
  //     const worker = new Worker(path.join(__dirname, '..', '..', 'workers', 'auth', 'logout.js'));
  //     // listen to message to wait response from worker
  //     worker.on("message", (data) => {
  //       res.status(data.ok ? StatusCodes.OK : StatusCodes.UNAUTHORIZED).send({ data });
  //     });
  //     // send authorization header to worker
  //     worker.postMessage(req.headers.authorization);
  //   } else {
  //     res.status(StatusCodes.BAD_REQUEST).send({});
  //   }
  // });
  
  // app.get("/me", (req, res) => {
  //   if (utils.authenticate(req.headers.authorization)) {
  //     const worker = new Worker(path.join(__dirname, '..', '..', 'workers', 'auth', 'me.js'));
  //     // listen to message to wait response from worker
  //     worker.on("message", (user) => {
  //       res.status(isEmpty(user) ? StatusCodes.UNAUTHORIZED : StatusCodes.OK).send({ user });
  //     });
  //     // send authorization header to worker
  //     worker.postMessage(req.headers.authorization);
  //   } else {
  //     res.status(StatusCodes.BAD_REQUEST).send({});
  //   }
  // });  
}
