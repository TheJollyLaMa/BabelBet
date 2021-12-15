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
  /* Grab Web3 */
  let web3 = new Web3(Web3.givenProvider || 'ws://localhost:7545');
  var CT_ContractAddress;
  var blockNum = await web3.eth.getBlockNumber((result) => {return result;});
  var account = await web3.eth.getAccounts().then((res) => {return res[0];});

  console.log("\n\n||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
      console.log("|||||||||||||||||||||||||||||||||||||||||||||🤑 🌎   BabelBet Challenge Watcher  🌏 🤑||||||||||||||||||||||||||||||||||||||||||||");
      console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n");
  console.log("\t🗳**** Block Info ****🗳");
  console.log("\tBlock Number at time of scheduled Cron Job: ", blockNum)
  console.log("\tWeb3 Account 1: ", account);
  var CT_Contract = await web3.eth.net.getId().then(function(net_id){
    console.log("\tCurrent Net Id: ", net_id);
     if(CT_json.networks[net_id]) {
       CT_ContractAddress = CT_json.networks[net_id].address;
       var c = new web3.eth.Contract(CT_json.abi, CT_ContractAddress);
      return c;}//else{return $window.alert("Challenge Token Smart contract not connected to selected network.")}
  });
  /* get challenges */
  var challenges = await CT_Contract.methods.getChallenges().call().then((res)=>{return res;});
  console.log("\tTotal Challenges Minted: " + challenges.length);
  console.log("\n\t|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n");
  /*  For Each Challenge ...   */
  for(var i=2; i <= challenges.length-1; i++){
      // console.log("i : ",i, ", challenges length : ", challenges.length);
      var status = challenges[i][4];
      // only continue through loop if the challenge token is active
      if(status == 0){
          var players = challenges[i][0], name = challenges[i][1], id = Number(challenges[i][2]);
          var mint_data = await web3.eth.abi.decodeParameters(['string', 'string', 'uint256', 'uint256'], challenges[i][3]);
          var mint_date = mint_data[0];
          var yyyy = mint_date.split(" ")[0].slice(0,4), mm = mint_date.split(" ")[0].slice(4,6), dd = mint_date.split(" ")[0].slice(6,8);
          mint_date = new Date(yyyy, mm, dd);
          var challenge_type = mint_data[1], streak_goal = mint_data[2], staked_amount = mint_data[3];

          var today = new Date(), end_date = new Date(mint_date);
          end_date.setDate(streak_goal);

          const time_delta1 = Math.abs(mint_date - today);
          var days_into_challenge = Math.ceil(time_delta1 / (1000 * 60 * 60 * 24));

          /*-- Challenge Token Report --*/
          console.log("\n\t**********************************************  🎫   Challenge ",i,"   🎫  ********************************************\n");
          console.log("\tId: " + id);
          console.log("\tName: " + name);
          console.log("\tPlayers: " + players);
          console.log("\tDetails: \n" + "\t\tmint date: " + mint_date + "\n\t\tchallenge type: " + challenge_type + "\n\t\tstreak goal: " + streak_goal + "\n\t\tstaked amount: " + staked_amount);
          console.log("\tStatus: " + status);
          console.log("\tEnd Date: " + end_date);
          console.log("\n");


          /*-- For Each Player in the Challenge --*/
          var payoutList = [];
          var this_players_streak = 0;
          for(var j = 0; j <= players.length-1; j++){
              // console.log("\n",j, " : ", players.length);
              /*--- Get Duo Info ---*/
              var duo_info = await CT_Contract.methods.Token_Player_Duo_Map(id,players[j]).call().then(res => {return res;});
              var duo_name = duo_info.split("::")[0];
              var duo_pass = duo_info.split("::")[1];
              const duo = new Duolingo({userName:duo_name, password:duo_pass});
              // console.log(duo);
              var streak = await duo.logIn().then( data => {return duo.getData().then( res => {return res.site_streak;}).catch();}).catch();
              var email = await CT_Contract.methods.Token_Player_Email_Map(id,players[j]).call().then(res => {return res;});
              /*--- Report Player Essentials ---*/
              console.log("\n\t|||||||||||||||||||||||||||||||||||||");
              console.log("\t|||||||||  🤑  Player",j," 🤑  ||||||||");
                console.log("\t|||||||||||||||||||||||||||||||||||||\n");

              console.log("\tDuoname: ",duo_name);
              console.log("\tToken Player Email Map: ",email);
              console.log("\tMint Date: ",mint_date);
              console.log("\tToday: ",today);
              console.log("\tDays into Challenge: ",days_into_challenge);
              console.log("\tEnd Date: ",end_date.toLocaleDateString("en-US"));
              console.log("\tPlayer Streak: ",streak);
              // function to check each players progress and notify them if they fall behind and thus forfeit funds
              console.log("\n\tIs Player Streak: ",streak,"  <  Days into Challenge: ",days_into_challenge, "?");
              if (streak < days_into_challenge){
                  console.log("\t✅Yes!");
                  console.log('\t❗Trigger forfeit funds email for : ', duo_name," ❗");
                  // TODO: Send email to a player when they forfeit funds
                  // player automatically removed from payout list by numbers, but they are sent a loser email with notice of funds forfeiture
              }else{
                // function to check if the challenge's end_date is today.  When the end_date comes, the players who have maintained the streak
                // receive their one share of the final pot (forfeited funds plus interest earned in escrow)
                console.log("\t✅No!\n");
                console.log("\tToday: ",today.toLocaleDateString("en-US"));
                console.log("\tEnd Date: ",end_date.toLocaleDateString("en-US"));
                var t = Date.parse(today.toLocaleDateString("en-US")), e_d = Date.parse(end_date.toLocaleDateString("en-US"));
                console.log("\t",t,e_d);
                // t > e_d
                if (1) {
                    console.log("\n\tStreak: ",streak);
                    console.log("\tStreak Goal: ", streak_goal);
                    if(streak >= streak_goal){
                        console.log("\n\t🎉 The Challenge is finished and you made it! 🎉");
                        console.log("\t💰💰💰 You've been added to the payout list, " + duo_name + "! 💰💰💰" );
                        // add to payoutList
                        payoutList.push([players[j],email]);
                    }else{
                      //  TODO: Email to players who didnt make it, AGAIN, to let them know about the pot they missed out on
                      console.log("\n\tToday is the end of the Challenge and you did not make it, " + duo_name);
                      console.log("\tEveryone who crossed the finish is enjoying a fat payout and a sharper tongue!");
                      console.log("\tThanks for participating and please come back when you're ready!");
                    }
                }else{
                  // If streak has not ended and goal has not been met, nothing happens - duolingo students continue showing up for language training every day!
                  console.log("\n\t" + duo_name + " is still meeting the terms of the challenge ...");
                  console.log("\tThe challenge is still going ... ");
                }
              }
          }
          console.log("\n\t******$$$$$$$$$$$$$$$$$$$$$$$$$$$******");
            console.log("\t$$$$$$💰💰💰  Payout Info  💰💰💰$$$$$$");
            console.log("\t******$$$$$$$$$$$$$$$$$$$$$$$$$$$******\n");
          payoutList.push([players[1],"solarmail888@gmail.com"]);
          // calculate payout amount
          payoutList = [payoutList[0][0],payoutList[1][0]];
          var payout_amount = (1/payoutList.length) * (staked_amount * players.length);
          var paWei = Number(await web3.utils.toWei(String(payout_amount)));
          console.log("\t payout_amount = (1 / payoutList.length) * (staked_amount * players.length)");
          console.log("\t",payout_amount," = (1 /",payoutList.length,") * (",staked_amount," * ",players.length,")");
          console.log("\t",String(payoutList));
          console.log("\t",id);
          console.log("\t",payout_amount,"eth or ",paWei,"Wei");
          console.log("\t",CT_ContractAddress);
          console.log("\t Transfer Amount: ", payout_amount * payoutList.length);
          var ct_Balance_before = await web3.eth.getBalance(CT_ContractAddress);
          var plyr1_eth_bal = await web3.eth.getBalance(payoutList[0]);
          var plyr2_eth_bal = await web3.eth.getBalance(payoutList[1]);
          console.log("\t account balances before: ",ct_Balance_before,"    ",plyr1_eth_bal,"    ",plyr2_eth_bal);
          // make sure contract has enough to afford payout
          if (ct_Balance_before >= payoutList.length * paWei){
            console.log(payoutList);
            console.log(id);
            console.log(paWei);
            // TODO: send payout_amount to list of Eth accounts that met the challenge
            await CT_Contract.methods.babelBet_Payout(payoutList,id,paWei).send({from: account, gas: 3000000});
            // .then(async (res)=>{
            //
            //       // get player's email
            //       // var email = await CT_Contract.methods.Token_Player_Email_Map(id,players[j]).call().then(res => {return res;});
            //
            //       //     var player_email_addr = payoutList[i][1];
            //       // TODO: emails sent to notify players of their challenge success, friend's success, and payout chart
            //       //         // challenge completed! - link to challenge page where players can view stats and past challeneges
            //       // }
            //     console.log("\n\t...black cat...",res);
            //       // TODO: change token Status
            //       // await ...
            //
            // });
            var ct_Balance_after = await web3.eth.getBalance(CT_ContractAddress);
            var plyr1_eth_bal_after = await web3.eth.getBalance(payoutList[0]);
            var plyr2_eth_bal_after = await web3.eth.getBalance(payoutList[1]);
            console.log("\tAccount balances after:  ",ct_Balance_after,"    ",plyr1_eth_bal_after,"    ",plyr2_eth_bal_after);
            console.log("\tthe difference: ",ct_Balance_after-ct_Balance_before,"\t",plyr1_eth_bal_after - plyr1_eth_bal,"\t",plyr2_eth_bal_after - plyr2_eth_bal);
            console.log("\n\tPayout Complete! Sending Emails ....\n");
          }else{console.log("❗Not enough cash in the contract to afford this payout ... :( ❗");}

          console.log("\n\t*************************************\n");
      }
  };
  console.log("\n||||||||||||||||||||||||||||||||||||||||||||||||**  BabelBet Contract Address  **||||||||||||||||||||||||||||||||||||||||||||||||||");
    console.log("||||||||||||||||||||||||||||||||||||** 🗃  ",CT_ContractAddress,"  🗃 **|||||||||||||||||||||||||||||||||||||||");
    console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    console.log("||||💫  TheJollyLaMa  💫||||||  ... running this task every thirty seconds with cron schedule ...  |||||||🤝   License: MIT  🤝||||");
    console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||🌍|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n\n\n");

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
