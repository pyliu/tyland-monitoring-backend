const path = require("path");
const fse = require("fs-extra");
const { readIniFileSync } = require('read-ini-file')
/**
 * load L05 configs
 */
const l05 = {
  logMySQLDSN: '',
  logMySQLUser: '',
  logMySQLPw: '',
  localSyncPath: '',
  bureauSyncIP: '',
  bureauSyncPort: '',
  processName: process.env.L05_PROCESS_NAME || 'l05schedule1'
};
const L05_INI_DIR = process.env.L05_INT_PATH;
if (fse.pathExistsSync(`${L05_INI_DIR}/L05UI.INI`) && fse.pathExistsSync(`${L05_INI_DIR}/SCHEDULE.INI`)) {
  const l05ui = readIniFileSync(path.join(L05_INI_DIR, 'L05UI.INI'));
  l05.logMySQLDSN = l05ui.DSN;
  l05.logMySQLUser = l05ui.USER_NAME;
  l05.logMySQLPw = l05ui.PASSWORD;
  const l05schedule = readIniFileSync(path.join(L05_INI_DIR, 'SCHEDULE.INI'));
  l05.localSyncPath = l05schedule.SOURCE_DIR?.replaceAll('\\:', ':');
  l05.bureauSyncIP = l05schedule.IP;
  l05.bureauSyncPort = l05schedule.PORT;
  
}
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
  l05,
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
    FAIL_NO_MYSQL: -10,
    FAIL_SYNC_ERROR: -11
  }
}

module.exports = config;
