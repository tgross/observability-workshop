'use strict';

const Http = require('http');
const Data = require('./lib/data');
const Template = require('./lib/template');
const util = require('util');


const log = function(req, code, msg) {
  var now = new Date().toISOString();
  var reqId = req.headers["x-request-id"];
  if (!reqId) {
    reqId = "-";
  }
  if (!msg) {
    msg = '-'
  }
  console.log('%s %s %s %s', now, reqId, req.url, msg)
}

// The root route queries MySQL and fills in a template
// with the data
const getRoot = function (req, res) {
  Data.select((err, content) => {
    if (err) {
      res.writeHead(500);
      log(req, 500, err);
      return
    }
    Template.render(content, (err, body) => {
      if (err) {
        res.writeHead(500);
        log(req, 500, err);
        return
      }
      res.writeHead(200);
      var now = new Date().toISOString()
      log(req, 200);
      return res.end(body);
    });
  });
}

// The /health route is used only by the health check to
// verify we can connect to the DB and can serve content
const getHealth = function (req, res) {
  Data.check((err) => {
    if (err) {
      res.writeHead(500);
      log(req, 500, err);
      return
    }
    res.writeHead(200);
    log(req, 200);
    return res.end("ok");
  });
}

const server = Http.createServer((req, res) => {
  if (req.url == '/health') {
    return getHealth(req, res);
  }
  return getRoot(req, res);
});

server.listen(3000, () => {
  var now = new Date().toISOString();
  console.log('[%s] Running Fortunes on port 3000', now);
});
