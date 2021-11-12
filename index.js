var createError = require('http-errors');
var express = require('express');
var path = require('path');
require('dotenv').config();
// import Duolingo from "duolingo-api-js";

var indexRouter = require('./routes/index');
var publicRouter = require('./routes/public');
var initiateChallengeRouter = require('./routes/initiate_challenge');
var acceptRouter = require('./routes/accept');
var counterOfferRouter = require('./routes/counter_offer');


var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'BackendViews'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/* Backend Routes*/
app.use('/', indexRouter);
app.use('/InitiateChallenge', initiateChallengeRouter);
app.use('/Accept', acceptRouter);
app.use('/CounterOffer', counterOfferRouter);

/* Frontend Routes*/
app.use('/public/index.html', express.static('public/index.html'));
app.use('/public', publicRouter);

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

module.exports = app;
