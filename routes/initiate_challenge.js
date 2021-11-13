var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const Web3 = require('web3');
//
let web3 = new Web3('ws://localhost:7545');


/* Initiate Challenge */
router.post('/', function(req, res, next) {

    var blockNum = web3.eth.getBlockNumber(function (error, result) {console.log("Block Number at time of initial Challenge: ", result)});
        
    console.log(req.body);
    /* collect information from initiator */
    var challenge_details = {
        initiator_email: req.body.initiator_email,
        initiator_email_password: req.body.initiator_email_password,
        email_to_challenge: req.body.email_to_challenge,
        initiator_eth_account: req.body.initiator_eth_account,
        duo_username: req.body.duo_username,
        duo_password: req.body.duo_password,
        proposal: {
            type: req.body.proposal.type,
            days: req.body.proposal.days,
            amount: req.body.proposal.amount
        }
    }
    /* Send Email to initiate the challenge  */

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: challenge_details.initiator_email,
        pass: challenge_details.initiator_email_password
      }
    });
    var subject = "On Guard! " + challenge_details.duo_username + " challenges you to a " + challenge_details.proposal.type + " challenge on DuoLingo on Ethereum in Matic Token!";
    var html = "<p><h3>" + challenge_details.duo_username + "</h3> challenges you to a " + challenge_details.proposal.type + "on DuoLingo!</p>";
        html += "<p>" + challenge_details.duo_username + " thinks they can reach a <h3>" + challenge_details.proposal.days + "</h3>  day streak! Do you believe you can keep a longer streak than them?</p>";
        html += "<p>They are so sure they are more dedicated than you, they staked " + challenge_details.proposal.amount + " matic on it!</p>";
        html += "<p>If you think you can outlast their streak, see thier " + challenge_details.proposal.amount + " matic and prove it!</p>";
        html += "<p><a href='http://localhost:8888/public/#!/Accept'><button height='75px' width='100px'>Accept & Stake</button></a></p>";
        html += "<br><br><p>Or you can suggest differenet terms.</p>";
        html += "<p><a href='http://localhost:8888/public/#!/CounterOffer'><button height='75px' width='100px'>Propose Changes</button></a></p><br><br>";

    var mailOptions = {
      from: challenge_details.initiator_email,
      to: challenge_details.email_to_challenge,
      subject: subject,
      html: html
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
});


module.exports = router;
