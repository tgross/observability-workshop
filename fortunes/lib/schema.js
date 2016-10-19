'use strict'
const mysql = require('mysql');

const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const db = process.env.MYSQL_DATABASE;
const host = process.env.MYSQL_HOST;

const assertCreds = function(key, env) {
  if (key == undefined) {
    console.error('Environment variable '+env+' is unset. Exiting.')
    process.exit(-1)
  }
}

assertCreds(user, 'MYSQL_USER');
assertCreds(password, 'MYSQL_PASSWORD');
assertCreds(db, 'MYSQL_DATABASE');
assertCreds(host, 'MYSQL_HOST');

exports.getConnection = () => {
  return mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: db
  });
}

// our schema
exports.create = 'CREATE TABLE fortunes (id INT, fortune TEXT);'

// An array of quotes we'll use to populate the database; source:
// http://www.journaldev.com/240/my-25-favorite-programming-quotes-that-are-funny-too
exports.initialInsert = `INSERT INTO fortunes (id, fortune) VALUES
    (1,"The best thing about a boolean is even if you are wrong, you are only off by a bit. (Anonymous)"),
    (2,"Without requirements or design, programming is the art of adding bugs to an empty text file. (Louis Srygley)"),
    (3,"Before software can be reusable it first has to be usable. (Ralph Johnson)"),
    (4,"The best method for accelerating a computer is the one that boosts it by 9.8 m/s2. (Anonymous)"),
    (5,"I think Microsoft named .Net so it wouldn't show up in a Unix directory listing. (Oktal)"),
    (6,"If builders built buildings the way programmers wrote programs, then the first woodpecker that came along wound destroy civilization. (Gerald Weinberg)"),
    (7,"There are two ways to write error-free programs; only the third one works. (Alan J. Perlis)"),
    (8,"Ready, fire, aim: the fast approach to software development. Ready, aim, aim, aim, aim: the slow approach to software development. (Anonymous)"),
    (9,"One [person's] crappy software is another [person's] full time job. (Jessica Gaston)"),
    (10,"A good programmer is someone who always looks both ways before crossing a one-way street. (Doug Linder)"),
    (11,"Always code as if the [person] who ends up maintaining your code will be a violent psychopath who knows where you live. (Martin Golding)"),
    (12,"Deleted code is debugged code. (Jeff Sickel)"),
    (13,"Walking on water and developing software from a specification are easy if both are frozen. (Edward V Berard)"),
    (14,"If debugging is the process of removing software bugs, then programming must be the process of putting them in. (Edsger Dijkstra)"),
    (15,"Software undergoes beta testing shortly before it's released. Beta is Latin for 'still doesn't work.' (Anonymous)"),
    (16,"Programming today is a race between software engineers striving to build bigger and better idiot-proof programs, and the universe trying to produce bigger and better idiots. So far, the universe is winning. (Rick Cook)"),
    (17,"It's a curious thing about our industry: not only do we not learn from our mistakes, we also don't learn from our successes. (Keith Braithwaite)"),
    (18,"There are only two kinds of programming languages: those people always bitch about and those nobody uses. (Bjarne Stroustrup)"),
    (19,"In order to understand recursion, one must first understand recursion. (Anonymous)"),
    (20,"The cheapest, fastest, and most reliable components are those that aren’t there. (Gordon Bell)"),
    (21,"The best performance improvement is the transition from the nonworking state to the working state. (J. Osterhout)"),
    (22,"The trouble with programmers is that you can never tell what a programmer is doing until it's too late. (Seymour Cray)"),
    (23,"Don't worry if it doesn't work right. If everything did, you'd be out of a job. (Mosher's Law of Software Engineering)")
    ;`;
