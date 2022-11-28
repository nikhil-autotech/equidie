let appConfig = {};
appConfig.port = process.env.PORT || 7777,
appConfig.allowedCorsOrigin = "*";
appConfig.env = "dev";
appConfig.db = {
    uri: `${process.env.DB_URI}`
}
appConfig.apiVersion = '/api';

module.exports = {

    port: appConfig.port,
    allowedCorsOrigin: appConfig.allowedCorsOrigin,
    environment: appConfig.env,
    db: appConfig.db,
    apiVersion: appConfig.apiVersion
}// end module exports