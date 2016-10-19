'use strict';

const Schema = require('./lib/schema');

var connection = Schema.getConnection();

// fetch a fortune
exports.select = function (cb) {
  connection.connect((err) => {
    if (err == null) {
      // TODO: this seems inefficient?
      connection.query('SELECT id, fortune FROM fortunes', [], (err, results, fields) => {
        val = results[Math.floor(Math.random() * 23)][1].fortune;
        cb(err, val);
      });
      // TODO: what if we did this instead?
      /*
      key = Math.floor(Math.random() * 23)
      connection.query('SELECT id, fortune FROM fortunes WHERE id=?',
                       [key],
                       (err, results, fields) => {
                         cb(err, results[0].fortune)
                       });
      */
    } else {
      cb(err);
    }
  });
}

// check to see if the table is set up and healthy
exports.check = function (cb) {
  connection.connect((err) => {
    if (err == null) {
      connection.query('SELECT COUNT(*) from fortunes', [], (err) => {
        cb(err);
      });
    }
    cb(err);
  });
}
