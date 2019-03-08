// adding library into nodejs
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
const assert = require('assert');
let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017"
let https = require('https');
let fs = require('fs')

// adding router processing block
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let apiRouter = require('./routes/api');
let identityRouter = require('./routes/identity');
let communicationRouter = require('./routes/communication');

let app = express();

// variable
let options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: "passphrase",
  requestCert: true,
  rejectUnauthorized: true,
  // ca: [ fs.readFileSync('../client/cert.pem') ]
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Mongo DB connection
MongoClient.connect(url, function (err, database) {
  assert.equal(null, err);
  db = database.db("IoTPlatform");
});


app.use(function(req, res, next) {
  console.log("Entering db reuse module...")
  req.db = db;
  next();
});

// route different url into different blocks
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/identity', identityRouter);
app.use('/commu', communicationRouter);
app.use('/api', apiRouter);


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

var httpsServer = https.createServer(options, app);
httpsServer.listen(4433);


module.exports = app;
