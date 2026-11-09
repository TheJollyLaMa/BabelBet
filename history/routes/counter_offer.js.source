var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const Web3 = require('web3');
let web3 = new Web3('ws://localhost:7545');

/* Offer Counter Challenge Proposal */
router.post('/', function(req, res, next) {

    var blockNum = web3.eth.getBlockNumber(function (error, result) {console.log("Block Number at time of Counter Offer: ", result)});
    /* collect information from counter offerer */
    // console.log(req.body);
    var counter_offer = {
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
   /* Send Email to offer different terms  */
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: counter_offer.email,
      pass: counter_offer.email_password
    }
  });
  var subject = "Idk " + counter_offer.duo_username + ". What about ...";
  var html = "<html><head></head><body><p> How about a ";
      html += counter_offer.proposal.type + " challenge for <h3>";
      html += counter_offer.proposal.days + " days and ";
      html += counter_offer.proposal.amount + " Matic?</h3></p></body></html>";
      html += "<br>Do you accept?\n";
      html += "<p><a href='http://localhost:8888/public/#!/Accept'><button height='75px' width='100px'>Accept & Stake</button></a></p>";
      html += "<br><p>Or you can suggest different terms.</p>";
      html += "<p><a href='http://localhost:8888/public/#!/CounterOffer/";
      html += counter_offer.email + "/";
      html += counter_offer.email_to_challenge + "/" + counter_offer.eth_account + "/";
      html += counter_offer.duo_username + "/";
      html += counter_offer.duo_username_to_challenge + "/" + counter_offer.proposal.type + "/";
      html += counter_offer.proposal.days + "/" + counter_offer.proposal.amount + "/";
      html += "'><button height='75px' width='100px'>Propose Changes</button></a></p><br><br>";
      html += "</body></html>";

  var mailOptions = {
    from: counter_offer.email,
    to: counter_offer.email_to_challenge,
    subject: subject,
    html: html
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error(error);
      res.send("The counter offer email did not go through.  You may need to 'enable less secure apps' to use your gmail account!");
    } else {
      console.log('Email sent: ' + info.response);
      res.send("A counter offer was proposed via email!");
    }
  });
})


module.exports = router;
