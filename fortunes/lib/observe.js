'use strict';
const bunyan = require('bunyan');

var logLevel = process.env.LOG_LEVEL
if (!logLevel) {
  logLevel = "info"
} else {
  logLevel = logLevel.toLowerCase();
}

exports.log = bunyan.createLogger({
  name: "fortunes",
  stream: process.stdout,
  level: logLevel
});

exports.elapsed_time = function(start) {
  var elapsed = process.hrtime(start);
  var sec = elapsed[0] * 1000;
  var ms = elapsed[1] / 1000000;
  return sec + ms;
}
