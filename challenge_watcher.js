var cron = require('node-cron');
import Duolingo from "duolingo-api-js";

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
     if(CT_json.networks[net_id]) {const CT_ContractAddress = CT_json.networks[net_id].address;var c = new web3.eth.Contract(CT_json.abi, CT_ContractAddress);
      return c;}//else{return $window.alert("Challenge Token Smart contract not connected to selected network.")}
  });

  const challenges = await CT_Contract.methods.getChallenges().call().then((res)=>{return res});
  console.log(challenges);
  console.log('running a task every sixty seconds');
  // for(key in object) {

  // }
});
