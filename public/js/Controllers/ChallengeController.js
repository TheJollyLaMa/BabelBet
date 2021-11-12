'use strict';

/*global app*/
app.controller('ChallengeController', ['$scope', 'ChallengeFactory', function ($scope, ChallengeFactory) {
var init = function() {
    $scope.err = '';
    $scope.greeting = "Is there someone you want to challenge to a friendly Duolingo streak contest?";
    $scope.initiate_challenge_form = {initiator_email: '', initiator_email_password: '', email_to_challenge: '', initiator_eth_account: '',  duo_username: '',duo_password: '', proposal: {type: '', days: '', amount: ''}};
    $scope.counter_challenge_form = {initiator_email: '', initiator_email_password: '', email_to_challenge: '', initiator_eth_account: '',  duo_username: '',duo_password: '', proposal: {type: '', days: '', amount: ''}};
    $scope.accept_challenge_form = {initiator_email: '', initiator_email_password: '', email_to_challenge: '', initiator_eth_account: '',  duo_username: '',duo_password: '', proposal: {type: '', days: '', amount: ''}};

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
       $scope.account = await web3.eth.getAccounts().then(function(accounts){return accounts[0];});
       $scope.display_account = $scope.account.toString().substring(0,4) + "   ....   " + $scope.account.toString().substring($scope.account.toString().length - 4);
       console.log($scope.display_account);

       $scope.$digest();

    }


    $scope.initiate_challenge = function (initiate_challenge_form) {
      console.log(initiate_challenge_form);
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
