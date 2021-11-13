var express = require('express');
var router = express.Router();
const Web3 = require('web3');
const CT_json = require('../abis/ChallengeToken.json');
const CT_X_json = require('../abis/CT_X.json');
// console.log(CT_json);
// console.log(CT_X_json);
//
let web3 = new Web3('ws://localhost:7545');

web3.eth.getBlockNumber(function (error, result) {
	  console.log("Block Number: ", result)
})
var account = web3.eth.getAccounts().then((res) => {console.log(res[0]);return res[0];})
const CT_Contract = web3.eth.net.getId().then(function(net_id){
  console.log(net_id);
   if(CT_json.networks[net_id]) {
     const CT_ContractAddress = CT_json.networks[net_id].address;
     var c = new web3.eth.Contract(CT_json.abi, CT_ContractAddress);
    return c;
  }//else{return $window.alert("Challenge Token Smart contract not connected to selected network.")}
});
/* Agree to terms and send funds to Escrow */
router.post('/', function(req,res,next) {

  // send both party's staked amount to the Escrow

      // escrow sends back an ID

  // check both party's streak stats everyday while the streak goal still isnt met

  // send emails to both parties confirming challenge terms and agreement as a receipt
        // has a button linkin got the frontend ViewChallenge

  var challengeID = "ID returned from Escrow lock"

  var transporter1 = nodemailer.createTransport({service: 'gmail',auth: {user: req.body.email_to_initiator,pass: req.body.initiator_email_password}});
  var transporter2 = nodemailer.createTransport({service: 'gmail',auth: {user: req.body.email_to_challenge,pass: req.body.challenger_email_password}});
  //
  var subject = "Challenge Accepted!  You got yourself a Dual o' Lingo!";
  var html = "<html><head></head><body>";
      html += "<p>On Guard!</p>";
      html += "<p><a href='http://localhost:8888/public/#!/ViewChallenge/";
      html += challengeID;
      html += "'><button height='200px' width='200px'>Challenge Stats</button></a></p>";
      html += "</body></html>";


  var mailOptions1 = {from: req.body.initiator_email,to: req.body.email_to_challenge,subject: subject,html: html};
  var mailOptions2 = {from: req.body.email_to_challenge,to: req.body.initiator_email,subject: subject,html: html};

  transporter1.sendMail(mailOptions1, function(error, info){if (error) {console.log(error);} else {console.log('Email sent: ' + info.response);}});
  transporter2.sendMail(mailOptions2, function(error, info){if (error) {console.log(error);} else {console.log('Email sent: ' + info.response);}});

})


module.exports = router;
