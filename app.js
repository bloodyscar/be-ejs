var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./app/auth/router');
var presensiRouter = require('./app/presensi/router');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'codeforgeek',
    saveUninitialized: true,
    resave: true
}));
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', authRouter);
app.use('/presensi', presensiRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
