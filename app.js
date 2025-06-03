var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv')
dotenv.config()
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');


var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// view engine setup
app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: {
    maxAge: 6000
  },
  store: new session.MemoryStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/user', require('./routes/userRoute'));
app.use('/api/transaksi', require('./routes/transaksiRoute'));
app.use('/api/cicilan', require('./routes/cicilanRoute'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = app;
