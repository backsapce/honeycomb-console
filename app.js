'use strict';
/**
 * app的主入口文件
 */
const App = require('hc-bee');
const app = new App();
const config = require('./config');

app.server.setTimeout(300000);

config.username = app.config.username;
config.password = app.config.password;

app.ready(true);


module.exports = app;
