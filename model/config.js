const config = {
  svrName: process.env.SVR_NAME,
  svrDesc: process.env.SVR_DESC,
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
  apiPrefix: 'api',
  apiVersion: 'v1',
  rootPath: require('path').resolve('./'),
  keyPath: 'key',
  dbPath: 'db',
  cachePath: 'cache',
  uploadPath: 'upload',
  l05MySQLUser: process.env.L05_MYSQL_USER,
  l05MySQLPw: process.env.L05_MYSQL_PW,
  l05MySQLDb: process.env.L05_MYSQL_DB,
  l05BuildtsPath: process.env.L05_BUILDTS_PATH,
  l05ProcessName: process.env.L05_PROCESS_NAME,
  statusCode: {
    SUCCESS: 1,
    FAIL: 0,
    FAIL_AUTH: -1,
    FAIL_NOT_FOUND: -2,
    FAIL_DUPLICATED: -3,
    FAIL_EXPIRE: -4,
    FAIL_NOT_IMPLEMENTED: -5,
    FAIL_NOT_CHANGED: -6,
    FAIL_NOT_SUPPORT: -7,
    FAIL_NOT_EXISTS: -8,
    FAIL_NOT_RUNNING: -9,
    FAIL_NO_MYSQL: -10
  }
}

module.exports = config;
