'use strict';

/*global app*/
app.controller('ChallengeController', ['$scope', '$window', 'BlockFactory', 'ChallengeFactory', function ($scope, $window, BlockFactory, ChallengeFactory) {
var init = function() {
    $scope.err = '';
    $scope.greeting = "Is there someone you want to challenge to a friendly Duolingo streak contest?";
    $scope.initiate_challenge_form = {initiator_email: '', initiator_email_password: '', email_to_challenge: '', initiator_eth_account: '', initiator_duo_username: '',initiator_duo_password: '', duo_username_to_challenge: '', proposal: {type: '', days: '', amount: ''}};
    $scope.counter_challenge_form = {initiator_email: '', initiator_email_password: '', email_to_challenge: '', initiator_eth_account: '', initiator_duo_username: '',initiator_duo_password: '', duo_username_to_challenge: '', proposal: {type: '', days: '', amount: ''}};
    $scope.accept_challenge_form = {initiator_email: '', initiator_email_password: '', email_to_challenge: '', initiator_eth_account: '', initiator_duo_username: '',initiator_duo_password: '', duo_username_to_challenge: '', proposal: {type: '', days: '', amount: ''}};

    $scope.loadTheBlock = async function () {
      // const web3 = window.web3;
      const web3 = new Web3(window.ethereum);
      try {
         // Request account access if needed
         window.ethereum.enable();
         // Acccounts now exposed
         resolve(web3);
       } catch (error) {
         // User denied account access...
         alert('Please allow access for the app to work');
       }

       $scope.CT_json = await BlockFactory.FetchTokenJSON();
       $scope.CT_X_json = await BlockFactory.FetchCT_X_JSON();


       $scope.account = await web3.eth.getAccounts().then(function(accounts){return accounts[0];});
       $scope.display_account = $scope.account.toString().substring(0,4) + "   ....   " + $scope.account.toString().substring($scope.account.toString().length - 4);
       console.log($scope.display_account);
       $scope.CT_Contract = await web3.eth.net.getId().then(function(net_id){
         console.log(net_id);
          if($scope.CT_json.networks[net_id]) {
            $scope.CT_ContractAddress = $scope.CT_json.networks[net_id].address;
            var c = new web3.eth.Contract($scope.CT_json.abi, $scope.CT_ContractAddress);
           return c;
         }else{return $window.alert("Challenge Token Smart contract not connected to selected network.")}
       });
       $scope.CT_X_Contract = await web3.eth.net.getId().then(function(net_id){
         console.log($scope.CT_X_json.networks[net_id]);
         if($scope.CT_X_json.networks[net_id]) {

           $scope.CT_X_ContractAddress = $scope.CT_X_json.networks[net_id].address;
           var c = new web3.eth.Contract($scope.CT_X_json.abi, $scope.CT_X_ContractAddress);
          return c;
        }else{return $window.alert("Challenge Token Execution Smart contract not connected to selected network.")}
       });

       $scope.$digest();

    }

    $scope.mint_challenge_token = function (new_challenge) {

       var today = new Date();
       today = String(today.getDate()).padStart(2, '0') + String(today.getMonth() + 1).padStart(2, '0') + today.getFullYear();
       var emails = new_challenge.email_to_challenge.split(",");

       new_challenge.issue_num = emails.length();
       new_challenge.ename = new_challenge.initiator_duo_username + " vs. " + new_challenge.duo_username_to_challenge + " : " + today;
       console.log(new_challenge.ename);
       console.log(new_challenge);
       //need an error catch for instance when contract rejects a previously minted ID
       // as in : ID is not Unique! Use a slightly different name! (add a number to it if your endeavor mints frequently)
       $scope.AT_XContract.methods
       .tokenGenesis(new_challenge.ename, new_challenge.esym, new_challenge.issue_num, today, new_challenge.stake_amount, new_challenge.payout_coefficient, new_challenge.streak_days)
       .send({ from: $scope.account })
       .once('receipt', async function(receipt) {
         var ManifestEvent = receipt.events.ManifestedChallengeToken.returnValues;
         console.log(ManifestEvent);
         $scope.new_token_uri = ManifestEvent[1];
         var escan_url = "https://etherscan.io/tx/" . receipt.transactionHash;
         alert("You're transaction is being mined.  You can view it here: " + escan_url)
         // console.log($scope.new_token_uri);
         // $scope.lastmintData = await web3.eth.abi.decodeParameters('string',MintDataEvent[0]);
         // console.log($scope.lastmintData);
         // $http.post(uri, ManifestEvent[0]);
         $scope.$digest();
       });
    }

/*

If you don't make it to the end of your streak, you forfeit a percentage of your original stake amount!!
some could go to the OA, and/or
the initiator and/or
a charity of our choice
a charity package targeted at dependencies and parent softwares or emergency innovations

*/



    $scope.initiate_challenge = function (initiate_challenge_form) {
      console.log(initiate_challenge_form);
      $scope.mint_challenge_token(initiate_challenge_form);
      ChallengeFactory.initiateChallenge(initiate_challenge_form)
      .then(function (res){
        // if(!res.status) {
        //     $scope.error = res;
        //     console.log(res);
        // }
        $location.path( "/Waiting" );

      });
    };
      $scope.counter_challenge = function (counter_challenge_form) {
        console.log(counter_challenge_form);
        ChallengeFactory.counterChallenge(counter_challenge_form)
        .then(function (res){
          // if(!res.status) {
          //     $scope.error = res;
          //     console.log(res);
          // }
        });

    };
      $scope.accept_challenge = function (accept_challenge_form) {
        console.log(accept_challenge_form);
        ChallengeFactory.acceptChallenge(accept_challenge_form)
        .then(function (res){
          // if(!res.status) {
          //     $scope.error = res;
          //     console.log(res);
          // }
        });

    };
};
init();
}]);
