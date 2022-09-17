const express = require('express');
const parseurl = require('parseurl');
const session = require('express-session');
const mysql = require('mysql');
const http = require('http');
const { Server } = require("socket.io");

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'virtual_screens'
});

pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
});
// const con = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: ""
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

const app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {}
  };

  // get the url pathname
  const pathname = parseurl(req).pathname;

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;

  next();
});

app.get('/foo', function (req, res, next) {
  res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
});

app.get('/bar', function (req, res, next) {
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
});

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function (req, res, next) {
    res.sendFile(__dirname + '/index.js');
});

// app.listen(3000);
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});