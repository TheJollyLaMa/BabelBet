var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cron = require('node-cron');
require('dotenv').config();
const Duolingo = require('duolingo-api-js'); // could not 'require' duolingo api. It is an ES module and needed to be imported as per ES6 standard. ** Changed the api to run CommonJs


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

// '* */12 * * *' every 12 hours - check the challenge token list for broken and completed streaks
cron.schedule('*/30 * * * * *', async () => {
  const Web3 = require('web3');
  const CT_json = require('./abis/ChallengeToken.json');
  const CT_X_json = require('./abis/CT_X.json');

  let web3 = new Web3('ws://localhost:7545');
  const blockNum = await web3.eth.getBlockNumber(function (error, result) {console.log("Block Number at time of scheduled Cron Job: ", result)});
  const account = await web3.eth.getAccounts().then((res) => {console.log("Web3 Account 1:\n", res[0]);return res[0];})
  const CT_Contract = await web3.eth.net.getId().then(function(net_id){
    console.log("Current Net Id:", net_id);
     if(CT_json.networks[net_id]) {
       const CT_ContractAddress = CT_json.networks[net_id].address;
       var c = new web3.eth.Contract(CT_json.abi, CT_ContractAddress);
      return c;}//else{return $window.alert("Challenge Token Smart contract not connected to selected network.")}
  });
  /* get challenges */
  // returning empty array for some unknown reason ....
  const challenges = await CT_Contract.methods.getChallenges().call().then((res)=>{return res;});
  // console.log(challenges);
  const duo = new Duolingo({userName:process.env.my_duo_name, password:process.env.my_duo_pass});
  // console.log(duo);
  // duo.logIn()
  //   .then( data => {
  //       console.log('data', data);
  //       duo.getData().then( res => {
  //           console.log('Site Streak: ', res.site_streak);
  //       }).catch();
  //   })
  //   .catch();
  /*  For Each Challenge ...   */
  for(var i=0; i <= challenges.length-1; i++){
      console.log("\nChallenge " + i + ":\n");
      var players = challenges[i][0];
      var name = challenges[i][1];
      var id = challenges[i][2];
      var mint_data = await web3.eth.abi.decodeParameters(['string', 'string', 'uint256', 'uint256'], challenges[i][3]);
      var status = challenges[i][4];
      console.log("\tPlayers: " + players);
      console.log("\tName: " + name);
      console.log("\tId: " + id);
      console.log("\tDetails: \n" + "\t\tmint date: " + mint_data[0] + "\n\t\tchallenge type: " + mint_data[1] + "\n\t\tstreak days: " + mint_data[2] + "\n\t\tstaked amount: " + mint_data[3]);
      console.log("\tStatus: " + status);
      // if not paid, or active challenge, or status not 1
      if(challenges[i].status == 0){
      //     //Get Duo info of Both/All Players on the challenge's PlayerList
      //
      //     /*-- for each player on the playerlist for this challenge --*/
          for(var j=0; j <= challenges[i].players.length; j++){
            var _name = challenges[i].playerlist[j][2];  //<-- looking for the third item in that player's spot in the playerlist - which should be that player's Duolingo name
      //       var player[j] = Duolingo.Duolingo(_name, _pass);
      //       var player[j]_duo_info = player[j].get_user_info();
      //       // If streak has not ended and goal has not been met, nothing happens - duolingo students continue showing up for language training every day!
      //       if ( players_current_streak <= this_challenge_streak_days && player_streak =! 0) {
      //           // Play on Garth
      //           // Play On Wayne
      //
      //        }else {
      //
      //      // If goal has been met - meaning a player or players have a streak that is greater than the challenge streak goal,
      //         if ( players_current_streak > this_challenge_streak_days ) {
      //           // pay player their stake back plus their divided portion of forfeitures and interest earned on escrow sweep
      //
      //           // total pot is split amongst the players that completed the challenge successfully
      //           // add to payoutlist
      //
      //           // challenge status changed to 1 or PAID
      //
      //           //
      //           //     emails to all players informing of payout and
      //           //     challenge completion with link to challenge page
      //           //     where players can view stats and past challeneges
      //           //
      //
      //
      //         }
          }
      }

  };
  console.log('running a task every sixty seconds');

});

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
