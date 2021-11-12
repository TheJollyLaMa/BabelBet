var express = require('express');
var router = express.Router();
// var PythonShell = require('python-shell');
var nodemailer = require('nodemailer');


/* GET Backend Homepage. */
router.get('/', function(req, res, next) {
});
router.post('/', function(req,res,next) {
  // send email to offer counter proposal
  var counter_offer = {
    challenger_eth_account: req.body.challenger_eth_account,
    challenger_duo_username: req.body.challenger_duo_username,
    challenger_duo_password: req.body.challenger_duo_password,
    proposal: {type: req.body.proposal.type, days: req.body.proposal.days, amount: req.body.proposal.amount}
   }

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: req.body.email_to_challenge,
      pass: req.body.challenger_email_password
    }
  });

  var subject = "Idk " + req.body.initiator_duo_username + ". What about ...";
  var html = "<html><head></head><body><p> How about , ";
      html += req.body.initiator_duo_username + ", a ";
      html += counter_offer.proposal.type + " challenge on DuoLingo for ";
      html += counter_offer.proposal.days + " days and ";
      html += counter_offer.proposal.amount + " Matic?</p></body></html>";
      html += "\nDo you accept?\n"
      html += "<p><a href='http://localhost:8888/public/#!/Accept'><button height='75px' width='100px'>Accept & Stake</button></a></p>"
      html += "<br><br><p>Or you can suggest different terms.</p>"
      html += "<p><a href='http://localhost:8888/public/#!/CounterOffer'><button height='75px' width='100px'>Propose Changes</button></a></p><br><br>"
      html += "</body></html>"


  var mailOptions = {
    from: req.body.email_to_challenge,
    to: req.body.initiator_email,
    subject: subject,
    text: html
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

})


module.exports = router;
