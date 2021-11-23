var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

const Web3 = require('web3');
const CT_json = require('../abis/ChallengeToken.json');
const CT_X_json = require('../abis/CT_X.json');
// console.log(CT_json);
// console.log(CT_X_json);
//
let web3 = new Web3('ws://localhost:7545');
var account = web3.eth.getAccounts().then((res) => {console.log("Web3 Account 1: ",res[0]);return res[0];})

/* Agree to terms and send funds to Escrow */
router.post('/', async function(req,res,next) {
  const CT_Contract = web3.eth.net.getId().then(function(net_id){
    console.log(net_id);
     if(CT_json.networks[net_id]) {
       const CT_ContractAddress = CT_json.networks[net_id].address;
       var c = new web3.eth.Contract(CT_json.abi, CT_ContractAddress);
      return c;
    }//else{return $window.alert("Challenge Token Smart contract not connected to selected network.")}
  });
  var blockNum = await web3.eth.getBlockNumber(function (error, result) {console.log("Block Number at the time the Challenge was accepted: ", result)});
  var today = new Date();
  console.log(today);
  var challenge_details = {
      playerlist: [],
      // function () {
      //                  var p_list = []
      //                  // for(var i=0; i <= req.body.playerList.length; i++){
      //                  //   p_list.push(req.body.playerList[i][1]);
      //                  // }
      //                  for (player in req.body.playerList){
      //                    console.log(player);
      //                    p_list.push(player[1]);
      //                  }
      //                  return p_list;
      //             },
      name: req.body.playerList[0][2] + today,
      num_to_issue: parseInt(req.body.playerList.length),
      type: req.body.proposal_type,
      days: parseInt(req.body.proposal_days),
      amount: parseInt(req.body.proposal_amount)
  }
  for (player in req.body.playerList){
       console.log(player[1]);
       challenge_details.playerlist.push(player[1]);
  }
  // mint token
  console.log(challenge_details.playerlist);
  // console.log("test: ", CT_Contract);
  // const challenges = await CT_Contract.methods.getChallenges().call().then((res)=>{return res});

  var challengeID = await CT_Contract.methods.tokenGenesis().call().then((res) => {
    console.log(res);  // send back an ID
    return res.id;
  });
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
