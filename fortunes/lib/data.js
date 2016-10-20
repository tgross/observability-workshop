'use strict';

const Schema = require('./schema');
const Observe = require('./observe');

var log = Observe.log;
var elapsed = Observe.elapsed_time;

var pool = Schema.getPool();

// fetch a fortune
exports.select = function (reqId, cb) {
  pool.getConnection((err, connection) => {
    if (err == null) {
      // TODO: this seems inefficient?
      var start = process.hrtime();
      connection.query(
        'SELECT id, fortune FROM fortunes', [],
        (err, results, fields) => {
          log.debug({req_id: reqId, elapsed: elapsed(start)}, "query time");
          var val = results[Math.floor(Math.random() * 23)].fortune;
          cb(err, val);
        });
      // TODO: what if we did this instead?
      /*
      key = Math.floor(Math.random() * 23)
      connection.query(
        'SELECT id, fortune FROM fortunes WHERE id=?', [key],
        (err, results, fields) => {
          log.debug({req_id: reqId, elapsed: elapsed(start)}, "query time");
          cb(err, results[0].fortune)
        });
        */
    } else {
      cb(err);
    }
    connection.release();
  });
}

// check to see if the table is set up and healthy
exports.check = function (cb) {
  pool.getConnection((err, connection) => {
    if (err == null) {
      connection.query('SELECT COUNT(*) from fortunes', [], (err) => {
        cb(err);
      });
    }
    cb(err);
    connection.release()
  });
}
