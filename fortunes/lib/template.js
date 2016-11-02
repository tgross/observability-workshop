'use strict';

const fs = require('fs')
const util = require('util')

exports.render = function(data, cb) {
  fs.open('/src/lib/template.html', 'r', (err, fd) => {
    var body = ''
    if (!err) {
      fs.readFile(fd, 'utf8', (err, contents) => {
        var rendered = util.format(contents, data)
        cb(null, rendered);
      });
      // TODO: oops!
      // fs.close(fd);
      return
    }
    fs.close(fd);
    cb(err, null);
  });
}
