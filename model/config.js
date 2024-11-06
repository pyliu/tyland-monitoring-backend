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
  syncPeriod: '',
  bureauSyncIp: '',
  bureauSyncPort: '',
  processName: process.env.L05_PROCESS_NAME || 'l05schedule1',
  logs: {
    base: process.env.L05_EXE_PATH || "C:/Quantasoft/L05/EXE",
    lines: process.env.L05_LOG_LINES || 100,
    stdout: `${process.env.L05_EXE_PATH}/stdout.log`,
    stderr: `${process.env.L05_EXE_PATH}/stderr.log`,
    sqlnet: `${process.env.L05_EXE_PATH}/sqlnet.log`
  }
};
const L05_INI_DIR = process.env.L05_INI_PATH || "C:/Quantasoft/L05/INI";
if (fse.pathExistsSync(`${L05_INI_DIR}/L05UI.INI`) && fse.pathExistsSync(`${L05_INI_DIR}/SCHEDULE.INI`)) {
  const l05ui = readIniFileSync(path.join(L05_INI_DIR, 'L05UI.INI'));
  l05.logMySQLDSN = l05ui.DSN;
  l05.logMySQLUser = l05ui.USER_NAME;
  l05.logMySQLPw = l05ui.PASSWORD;
  const l05schedule = readIniFileSync(path.join(L05_INI_DIR, 'SCHEDULE.INI'));
  l05.localSyncPath = l05schedule.SOURCE_DIR?.replaceAll('\\:', ':');
  l05.bureauSyncIp = l05schedule.IP;
  l05.bureauSyncPort = l05schedule.PORT;
  l05.syncPeriod = l05schedule.PERIOD;
  
}

/**
 * load Bank configs
 */
const bank = {
  mssqlUser: process.env.BANK_MSSQL_USER,
  mssqlPw: process.env.BANK_MSSQL_PW,
  localDBIP: '',
  bureauDBIP: ''
};
const SVS_INI_DIR = process.env.BANK_INT_PATH;
if (fse.pathExistsSync(`${SVS_INI_DIR}/DJSVS.ini`)) {
  const djsvs = readIniFileSync(path.join(SVS_INI_DIR, 'DJSVS.ini'));
  bank.localDBIP = djsvs.BranchDBServerIP;
  bank.bureauDBIP = djsvs.CenterDBServerIP;
}

const config = {
  svrName: process.env.SVR_NAME,
  svrDesc: process.env.SVR_DESC,
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
  isDebug: ['YES', 'Y', 'TRUE', '1', 'T'].includes(process.env.DEBUG?.toUpperCase()),
  printTSLog: process.env.NODE_ENV !== 'production' || ['YES', 'Y', 'TRUE', '1', 'T'].includes(process.env.DEBUG?.toUpperCase()),
  apiPrefix: 'api',
  apiVersion: 'v1',
  rootPath: require('path').resolve('./'),
  keyPath: 'key',
  dbPath: 'db',
  cachePath: 'cache',
  uploadPath: 'upload',
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
    FAIL_NO_DATABASE: -10,
    FAIL_SYNC_ERROR: -11,
    FAIL_NOT_REACHABLE: -12
  },
  l05,
  bank
}

module.exports = config;
