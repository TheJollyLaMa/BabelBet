var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cron = require('node-cron');
require('dotenv').config();

// '* */12 * * *' every 12 hours - check the docs
// cron.schedule('*/60 * * * * *', async () => {
//   const Web3 = require('web3');
//   const CT_json = require('./abis/ChallengeToken.json');
//   const CT_X_json = require('./abis/CT_X.json');
//   // import Duolingo from "duolingo-api-js";
//
//   let web3 = new Web3('ws://localhost:7545');
//   const blockNum = await web3.eth.getBlockNumber(function (error, result) {console.log("Block Number at time of scheduled Cron Job: ", result)});
//   const account = await web3.eth.getAccounts().then((res) => {console.log("Web3 Account 1:\n", res[0]);return res[0];})
//   const CT_Contract = await web3.eth.net.getId().then(function(net_id){
//     console.log("Current Net Id:", net_id);
//      if(CT_json.networks[net_id]) {const CT_ContractAddress = CT_json.networks[net_id].address;var c = new web3.eth.Contract(CT_json.abi, CT_ContractAddress);
//       return c;}//else{return $window.alert("Challenge Token Smart contract not connected to selected network.")}
//   });
//
//   const challenges = await CT_Contract.methods.getChallenges().call().then((res)=>{return res});
//   console.log(challenges);
//   console.log('running a task every sixty seconds');
//   // for(key in object) {
//
//   // }
// });

var indexRouter = require('./routes/index');
var publicRouter = require('./routes/public');
var initiateChallengeRouter = require('./routes/initiate_challenge');
var acceptRouter = require('./routes/accept');
var counterOfferRouter = require('./routes/counter_offer');
var viewChallengeRouter = require('./routes/view_challenge');


var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Smart Contract ABI on Ethereum or Matic or whatever suits your purposes */
app.use('/abis/ChallengeToken.json', express.static('abis/ChallengeToken.json'));
app.use('/abis/CT_X.json', express.static('abis/CT_X.json'));

// view engine setup
app.set('views', path.join(__dirname, 'BackendViews'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/* Backend Routes*/
app.use('/', indexRouter);
app.use('/InitiateChallenge', initiateChallengeRouter);
app.use('/Accept', acceptRouter);
app.use('/CounterOffer', counterOfferRouter);
app.use('/ViewChallenge', viewChallengeRouter);

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
