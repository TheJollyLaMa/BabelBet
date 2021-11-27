var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const Web3 = require('web3');
let web3 = new Web3('ws://localhost:7545');
// import sha256 from 'crypto-js/sha256';

// const message, nonce, path, privateKey; // ...





/* Initiate Challenge */
router.post('/', function(req, res, next) {

    var blockNum = web3.eth.getBlockNumber(function (error, result) {console.log("Block Number at time of initial Challenge: ", result)});
    /* collect information from initiator */
    var challenge_details = {
        email: req.body.email,
        email_password: req.body.email_password,
        email_to_challenge: req.body.email_to_challenge,
        eth_account: req.body.eth_account,
        duo_username: req.body.duo_username,
        duo_password: req.body.duo_password,
        duo_username_to_challenge: req.body.duo_username_to_challenge,
        proposal: {
            type: req.body.proposal.type,
            days: req.body.proposal.days,
            amount: req.body.proposal.amount
        }
    }
    console.log("New Challenge: ");
    for(var i=0; i <= challenge_details.length; i++){
      if(challenge_details[i] === 'email_password'){
        console.log('******');
      }
      else{
        console.log(challenge_details[i]);
      }
    }
    try{

      const hash = "That's a bad Hash Dude ...";//sha256(challenge_details.email_password);
      console.log("Pass Hash: ", hash);
    }catch (err) {
      console.log(err);
    }

    /* Send Email to initiate the challenge  */
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: challenge_details.email,
        pass: challenge_details.email_password
      }
    });
    var subject = "On Guard, " + challenge_details.duo_username_to_challenge + "! " + challenge_details.duo_username + " challenges you to a " + challenge_details.proposal.type + " challenge on Babel Bet!";
    var html = "<p><h3>" + challenge_details.duo_username + "</h3> challenges you to a " + challenge_details.proposal.type + " on DuoLingo!</p>";
        html += "<p>" + challenge_details.duo_username + " thinks they can keep a streak for <h3>" + challenge_details.proposal.days + "</h3> days!</p>"
        html += "Do you believe you can keep up with them?</p>";
        html += "<p>They are so dedicated, they staked <h3>" + challenge_details.proposal.amount + " matic</h3> on it!</p>";
        html += "<p>If you think you can outlast their streak, see thier " + challenge_details.proposal.amount + " matic and put yo matic where yo mouth is!</p><br>";
        html += "<p><a href='http://localhost:8888/public/#!/Accept/";
        html += challenge_details.email + "/";
        html += challenge_details.email_to_challenge + "/" + challenge_details.eth_account + "/";
        html += challenge_details.duo_username + "/";
        html += challenge_details.duo_username_to_challenge + "/" + challenge_details.proposal.type + "/";
        html += challenge_details.proposal.days + "/" + challenge_details.proposal.amount + "/";
        html += "'><button height='100px' width='125px'>Accept & Stake</button></a></p>";
        html += "<br><p>Or you can suggest different terms.</p>";
        html += "<br><p><a href='http://localhost:8888/public/#!/CounterOffer/";
        html += challenge_details.email + "/";
        html += challenge_details.email_to_challenge + "/" + challenge_details.eth_account + "/";
        html += challenge_details.duo_username + "/";
        html += challenge_details.duo_username_to_challenge + "/" + challenge_details.proposal.type + "/";
        html += challenge_details.proposal.days + "/" + challenge_details.proposal.amount + "/";
        html += "'><button height='100px' width='125px'>Propose Changes</button></a></p><br><br>";

    var mailOptions = {
      from: challenge_details.email,
      to: challenge_details.email_to_challenge,
      subject: subject,
      html: html
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.send("An email was sent. Challenge Initiated!");
});


module.exports = router;
