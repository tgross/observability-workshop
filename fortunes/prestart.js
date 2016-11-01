'use strict'
/*
prestart.js will force us to wait to start until MySQL has started,
enforce that we've properly set up credentials for the DB, and will
pre-populate the DB if it hasn't yet been populated.
*/
const Schema = require('./lib/schema');
const Observe = require('./lib/observe');

var log = Observe.log;
var connected = false;
var connection = Schema.getConnection();

const quit = function(code) {
  connection.end(); // always close our connection
  process.exit(code);
}

const checkTable = function(cb) {
  connection.query("SHOW TABLES LIKE 'fortunes';", [], (err, results, fields) => {
    if (err) {
      log.error({err: err, req_id: "prestart"}, "could not SHOW TABLES")
      quit(1)
    } else {
      if (results.length == 0)  {
        createTable(cb);
      } else {
        cb();
      }
    }
  })
}

const createTable = function(cb) {
  connection.query(Schema.create, [], (err) => {
    if (err) {
      log.error({err: err, req_id: "prestart"},
                "could not create fortunes table");
      quit(1);
    } else {
      cb();
    }
  });
}

const checkData = function() {
  connection.query("SELECT COUNT(*) as count FROM fortunes;", [],
                   (err, results, fields) => {
    if (err) {
      log.error({err: err, req_id: "prestart"},
                "error checking initial data");
      quit(1);
    } else {
      if (results[0].count == 0) {
        loadData();
      } else {
        log.info({req_id: "prestart"}, "initial data already exists");
        quit(0);
      }
    }
  });
}

const loadData = function() {
  connection.query(Schema.initialInsert, [], (err) => {
    if (err) {
      log.error({err: err, req_id: "prestart"}, "could not load fortunes data");
    }
    log.info({req_id: "prestart"}, "initial data loaded");
    quit(0);
  });
}


log.info({req_id: "prestart"}, "creating DB connection");

// we'll just die if MySQL isn't up yet rather than messing around with
// resetting the lib's state machine for the connection. This is a little
// dirty but we can count on the supervisor to restart the node process
// after the prestart exits.
connection.connect(function(err) {
  if (err != null) {
    log.warn({req_id: "prestart"}, "could not establish connection")
    quit();
  }
  log.info({req_id: "prestart"}, "connection established");
  checkTable(checkData);
  return;
});
