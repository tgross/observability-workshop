'use strict';

const Http = require('http');
const Data = require('./lib/data');
const Template = require('./lib/template');
const bunyan = require('bunyan');

var log = bunyan.createLogger({
  name: "fortunes",
  stream: process.stdout,
  level: "info"
});

// The root route queries MySQL and fills in a template
// with the data
const getRoot = function (req, res) {
  var reqId = req.headers["x-request-id"];
  Data.select((err, content) => {
    if (err) {
      res.writeHead(500);
      log.error({err: err, req_id: reqId}, "error in querying data");
      return
    }
    Template.render(content, (err, body) => {
      if (err) {
        res.writeHead(500);
        log.error({err: err, req_id: reqId}, "error in rendering template");
        return
      }
      res.writeHead(200);
      log.info({req_id: reqId}, "ok");
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
      log.error({err: err, req_id: "health"}, "error in health check");
      return
    }
    res.writeHead(200);
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
  log.info({msg: "Running Fortunes on port 3000"});
});
