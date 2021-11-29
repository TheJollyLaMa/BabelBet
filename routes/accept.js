var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const Duolingo = require('duolingo-api-js');
const Web3 = require('web3');
const CT_json = require('../abis/ChallengeToken.json');
const CT_X_json = require('../abis/CT_X.json');

// console.log(CT_json);
// console.log(CT_X_json);

let web3 = new Web3('ws://localhost:7545');
var account = web3.eth.getAccounts().then((res) => {console.log("Web3 Account 1: ",res[0]);return res[0];})

/* Agree to terms and send funds to Escrow */
router.post('/', async function(req,res,next) {
  const CT_Contract = await web3.eth.net.getId().then(function(net_id){
    console.log(net_id);
     if(CT_json.networks[net_id]) {
       const CT_ContractAddress = CT_json.networks[net_id].address;
       var c = new web3.eth.Contract(CT_json.abi, CT_ContractAddress);
      return c;
    }//else{return $window.alert("Challenge Token Smart contract not connected to selected network.")}
  });
  var blockNum = await web3.eth.getBlockNumber(function (error, result) {console.log("Block Number at the time the Challenge was accepted: ", result)});
  var today = new Date();
  today = today.toLocaleDateString("en-US")
  console.log(today);
  // console.log(req.body.playerList);
  // console.log(req.body.playerList[0][1]);
  // console.log(req.body.playerList[1]);
  // var challenge_details = {
  //     playerlist: {},
  //     name: req.body.playerList[0][2] + " : " + today,
  //     num_to_issue: parseInt(req.body.playerList.length),
  //     type: req.body.challenge_details.proposal.type,
  //     days: parseInt(req.body.challenge_details.proposal.days),
  //     amount: parseInt(req.body.challenge_details.proposal.amount)
  // }
  console.log(req.body);
  // req.body.playerList.forEach((player) => {challenge_details.playerlist.emails.append(player[0]);});
  // req.body.challenge_details.playerList.forEach((player) => {challenge_details.playerlist.addrs.append(player[1]);});
  // req.body.playerList.forEach((player) => {challenge_details.playerlist.duonames.append(player[2]);});
/*
    iterate through player list and get duo streak info for each player
    // get duo info so the players current streak count will become the challenge streak count '0'
    // for that player. this way the challenge counts from where the player was in their streak when
    // they joined the challenge
    var duo = DuoLingo.DuoLingo(req.body.duo_username,req.body.duo_password);
    var duo1_streak_at_start = duo.logIn()
      .then( data => {
          // console.log('data', data);
          duo.getData().then( res => {
              console.log('Site Streak: ', res.site_streak);
              return res.site_streak;
          }).catch();
      })
      .catch();
    console.log(duo1_streak_at_start);
 */
  // mint token
  // console.log(challenge_details);
  // const challenges = await CT_Contract.methods.getChallenges().call().then((res)=>{return res});

// 26NOV2021 - solved a bug that had to do with the CT_Contract variable not being filled at this point due to a missing await statement on the initial contract assignment up above.
// *** If you know the contract exists, you know the method is there, check your local scope & timing to make sure all the abi calls are called and returned on time
//  or else it will appear as though the function exists when you print the abi to screen, and it just will not be able to be called because the variable isnt filled at the time it is being used.
// an error will also tell you the function does not exist which you will know to be false and left scratching your head.
// ** Check your SYNC/ASYNC order pendejo!


  // create challenge token and return ID
  var challengeID = await CT_Contract.methods.tokenGenesis(
    challenge_details.playerlist.addrs,
      challenge_details.name,
        challenge_details.num_to_issue,
          today,
            challenge_details.type,
              challenge_details.days,
                challenge_details.amount)
  .call().then((res) => {return res;});
  console.log(challengeID);


  // send return email to other party confirming challenge terms and agreement have been set on contracts
  // send email to self acting as receipt for transaction
  // receipt has Challenge ID
  // has a button linking to the frontend ViewChallenge
  // var transporter1 = nodemailer.createTransport({service: 'gmail',auth: {user: req.body.email,pass: req.body.email_password}});
  // var transporter2 = nodemailer.createTransport({service: 'gmail',auth: {user: req.body.email,pass: req.body.email_password}});
  // //
  // var subject = "Challenge Accepted!  You got yourself a Dual o' Lingo!";
  // var html = "<html><head></head><body>";
  //     html += "<p>On Guard!</p>";
  //     html += "<p><a href='http://localhost:8888/public/#!/ViewChallenge/";
  //     html += challengeID;
  //     html += "'><button height='200px' width='200px'>Challenge Stats</button></a></p>";
  //     html += "</body></html>";
  //
  // var mailOptions1 = {from: req.body.email,to: req.body.email_to_challenge,subject: subject,html: html};
  // var mailOptions2 = {from: req.body.email,to: req.body.email,subject: subject,html: html};
  //
  // transporter1.sendMail(mailOptions1, function(error, info){if (error) {console.log(error);} else {console.log('Email sent: ' + info.response);}});
  // transporter2.sendMail(mailOptions2, function(error, info){if (error) {console.log(error);} else {console.log('Email sent: ' + info.response);}});


  // check both party's streak stats everyday while the streak goal still isnt met
  // if (goal_not_met) && (player1streak) && (player2streak) {
        // continue on with challenge
        // check tomorrow
  // } else {
        // execute payout
  // }
  str = "Challenge Token Minted!  id: " + challengeID;
  res.send(str);
})


module.exports = router;
