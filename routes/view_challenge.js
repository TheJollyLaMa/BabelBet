/*
Called from view challenge route in the front end to fetch the challenge token by id
*/
var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const Web3 = require('web3');
let web3 = new Web3('ws://localhost:7545');

/* Offer Counter Challenge Proposal */
router.post('/', function(req, res, next) {
    var blockNum = web3.eth.getBlockNumber(function (error, result) {console.log("Block Number at time of Counter Offer: ", result)});
});

module.exports = router;
