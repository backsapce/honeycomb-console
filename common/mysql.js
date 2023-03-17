'use strict';
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const async = require('async');

const log = require('./log');
const config = require('../config');
const patch = require('../ddl/patch/mysql');

let pool;

let readyFn;
let flagReady = false;

// lazy open connection
exports.ready = function (cb) {
  if (flagReady) {
    return cb();
  }
  readyFn = cb;

  if (!config.meta.user) {
    config.meta.user = config.meta.username;
  }

  if (!config.meta.connectionLimit) {
    config.meta.connectionLimit = 3;
  }
  pool = mysql.createPool(config.meta);
  // exec table create process
  // TODO: export async callback function to make sure db ready before main program boot.
  pool.getConnection(function (err, conn) {
    let statments = fs.readFileSync(path.join(__dirname, '../ddl/ddl_mysql.sql')).toString();

    statments = statments.split(/\n\n/);
    async.eachSeries(statments, (st, done) => {
      conn.query(st, (err) => {
        if (err && /^(alter|rename) table/ig.test(st)) {
          console.log('ddl init warn, sql:', st, 'error:', err.message);

          return done();
        }
        done(err);
      });
    }, (err) => {
      if (err && !err.ignore) {
        log.error(err);
        throw err;
      }

      const done = () => {
        flagReady = true;

        readyFn && readyFn();
      };

      patch(conn).then(done).catch(done);
    });
  });

  if (config.meta.session_variables) {
    log.debug(mysql.format('SET SESSION ?', config.meta.session_variables));
    for (let i = 0; i < config.meta.connectionLimit; i++) {
      pool.getConnection(function (err, conn) {
        if (err) {
          return log.error(err);
        }
        conn.query('SET SESSION ?', config.meta.session_variables, function () {
          conn.release();
        });
      });
    }
  }
};

exports.query = function (sql, param, callback) {
  pool.query(sql, param, callback);
};
