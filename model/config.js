const config = {
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
  apiPrefix: 'api',
  apiVersion: 'v1',
  rootPath: require('path').resolve('./'),
  keyPath: 'key',
  dbPath: 'db',
  cachePath: 'cache',
  uploadPath: 'upload',
  connUri: `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  dbUsername: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  statusCode: {
    SUCCESS: 1,
    FAIL: 0,
    FAIL_AUTH: -1,
    FAIL_NOT_FOUND: -2,
    FAIL_DUPLICATED: -3,
    FAIL_EXPIRE: -4,
    FAIL_NOT_IMPLEMENTED: -5,
    FAIL_NOT_CHANGED: -6
  }
}

module.exports = config;
