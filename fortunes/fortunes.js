'use strict';

const Http = require('http');
const Data = require('./lib/data');

// ------------------------------------------------


// The root route queries MySQL and fills in a template
// with the data
const getRoot = function (req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(body);
}


// ------------------------------------------------

// The /health route is used only by the health check to
// verify we're serving content
const getHealth = function (req, res) {
  body = { 'healthy': true };
  Data.check((err) => {
    if (err) {
      res.writeHead(500);
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(body));
  });
}

// ------------------------------------------------

const server = Http.createServer((req, res) => {
  if (req.path == '/health') {
    return getHealth(req, res);
  }
  return getRoot(req, res);
});


server.listen(3000, () => {
  console.log('Running Fortunes on port 3000');
});
