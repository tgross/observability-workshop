'use strict';

const Http = require('http');
const Data = require('./lib/data');
const Template = require('./lib/template');

// The root route queries MySQL and fills in a template
// with the data
const getRoot = function (req, res) {
  Data.select((err, content) => {
    if (err) {
      res.writeHead(500);
      console.error(err);
      return
    }
    Template.render(content, (err, body) => {
      if (err) {
        res.writeHead(500);
        console.error(err);
        return
      }
      res.writeHead(200);
      return res.end(body);
    });
  });
}

// The /health route is used only by the health check to
// verify we're serving content
const getHealth = function (req, res) {
  Data.check((err) => {
    if (err) {
      res.writeHead(500);
      console.error(err);
      return
    }
    res.writeHead(200);
    return res.end("ok");
  });
}

const server = Http.createServer((req, res) => {
  if (req.path == '/health') {
    return getHealth(req, res);
  }
  return getRoot(req, res);
});

server.listen(3000, () => {
  console.log('Running Fortunes on port 3000');
});
