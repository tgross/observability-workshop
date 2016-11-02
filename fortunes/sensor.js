'use strict'
const exec = require('child_process').exec;

// get the free memory in MB
const mem = function() {
  var child = exec("free -m | awk -F' +' '/Mem/{print $3}'", (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.log(stdout);
      process.exit(0);
    }
  });
}

// get the number of open file handles
const handles = function() {
  var child = exec("lsof | wc -l", (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.log(stdout);
      process.exit(0);
    }
  });
}

var arg = process.argv[2];
if (arg == "mem") {
  mem()
} else if (arg == "handles"){
  handles()
} else {
  console.log("unknown sensor command")
}
