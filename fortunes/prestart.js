'use strict'
/*
prestart.js will force us to wait to start until MySQL has started,
enforce that we've properly set up credentials for the DB, and will
pre-populate the DB if it hasn't yet been populated.
*/
const Schema = require('./lib/schema');

var connected = false;
var connection = Schema.getConnection();

const quit = function(code, msg) {
  if (msg) {
    console.error(msg);
  }
  connection.end(); // always close our connection
  process.exit(code);
}

const connect = function(cb) {
  connection.connect(function(err) {
    if (err != null) {
      process.stdout.write(".");
      cb(false);
      return;
    }
    console.log('connection established!');
    cb(true);
  });
}


const checkTable = function(cb) {
  connection.query("SHOW TABLES LIKE 'fortunes';", [], (err, results, fields) => {
    if (err) {
      quit(1, 'could not SHOW TABLES: '+err.code);
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
      quit(1, `Could not create fortunes table. ${err}`);
    } else {
      cb();
    }
  });
}

const checkData = function() {
  connection.query("SELECT COUNT(*) as count FROM fortunes;", [], (err, results, fields) => {
    if (err) {
      quit(1, 'error checking initial data: '+err.code);
    } else {
      if (results[0].count == 0) {
        loadData();
      } else {
        quit(0, 'initial data already exists.');
      }
    }
  });
}

const loadData = function() {
  connection.query(Schema.initialInsert, [], (err) => {
    if (err) {
      quit(1, `Could not load fortunes data. ${err}`);
    }
    quit(0, 'initial data loaded.');
  });
}


console.log('creating DB connection...')
setInterval(function() {
  if (!connected) {
    connect((conn) => {
      if (conn) {
        connected =true;
      }
    });
  } else {
    checkTable(checkData);
  }
}, 500);
