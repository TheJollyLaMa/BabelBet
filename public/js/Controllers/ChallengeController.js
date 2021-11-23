'use strict';
/*global app*/
app.controller('ChallengeController', ['$scope', '$window', '$location', '$routeParams', 'BlockFactory', 'ChallengeFactory', function ($scope, $window, $location, $routeParams, BlockFactory, ChallengeFactory) {
var init = function() {
    $scope.err = '';
    $scope.greeting = "Is there someone you want to challenge to a friendly Duolingo streak contest?";
    $scope.initiate_challenge_form = {
      email: 'boyyee44@gmail.com', email_password: '', email_to_challenge: 'solarmail888@gmail.com', eth_account: '', duo_username: 'JollyLaMa1', duo_password: '', duo_username_to_challenge: 'TeReDaDa108', proposal: {type: 'Show Down(Streak)', days: 8, amount: 1}
    };
    $scope.counter_offer_form = {};
    $scope.accept_challenge_form = {playerList: [['',''],['','']]};
    $scope.loadTheBlock = async function () {
       // prompt user to bring in Web3
       const web3 = new Web3(window.ethereum);
       try {
          window.ethereum.enable();resolve(web3);
       } catch (error) {
         console.log(error);
         // alert('Please allow access for the app to work');
       }

       $scope.CT_json = await BlockFactory.FetchTokenJSON();
       $scope.CT_X_json = await BlockFactory.FetchCT_X_JSON();

       $scope.account = await web3.eth.getAccounts().then(function(accounts){return accounts[0];});
       $scope.initiate_challenge_form.eth_account = $scope.account;
       $scope.counter_offer_form.eth_account = $scope.account;
       $scope.accept_challenge_form.playerList[0][1] = $scope.account;
       console.log($scope.accept_challenge_form);
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
         // console.log($scope.CT_X_json.networks[net_id]);
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
       // today = String(today.getDate()).padStart(2, '0') + String(today.getMonth() + 1).padStart(2, '0') + today.getFullYear();
       // var emails = new_challenge.email_to_challenge.split(",");
       //
       // new_challenge.issue_num = emails.length();
       // new_challenge.ename = new_challenge.duo_username + new_challenge.duo_username_to_challenge + today;
       // new_challenge.esym = new_challenge.duo_username + " vs. " + new_challenge.duo_username_to_challenge;
       // console.log(new_challenge.ename);
       // console.log(new_challenge);
       //need an error catch for instance when contract rejects a previously minted ID
       // as in : ID is not Unique! Use a slightly different name! (add a number to it if your endeavor mints frequently)
       $scope.CT_Contract.methods
       .tokenGenesis()
       .send({ from: $scope.account })
       .once('receipt', async function(receipt) {
         console.log(receipt);
         var escan_url = "https://etherscan.io/tx/" . receipt.transactionHash;
         alert("You're transaction is being mined.  You can view it here: " + escan_url)
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
    $scope.fillCounterOfferForm = function () {
        // console.log($routeParams);
        $scope.counter_offer_form = {
          'email': $routeParams.email_to_challenge, // this is actually the email of the person first challenged - so the Email SENDER this time in the counteroffer
          //collect email password from used to send conteroffer email
          'email_to_challenge': $routeParams.email,
          // 'eth_account': $scope.account, it's collected in 'loadTheBlock()'
          'duo_username': $routeParams.duo_username_to_challenge, // Again, this and the name to challenge are flip flopped.  The counter_offer_form has the duoname of the person originally challenged and needs to collect their password
          // Collect Duo Password in Frontend Form
          'duo_username_to_challenge': $routeParams.duo_username,
          'proposal': {
            'type': $routeParams.proposal_type,
            'days': parseInt($routeParams.proposal_days),
            'amount': parseInt($routeParams.proposal_amount)
          }
        }
        // console.log($scope.counter_offer_form);
    }

    $scope.fillAcceptChallengeForm = function () {
      // console.log($routeParams);
      $scope.accept_challenge_form = {
        'playerList': [
          [$routeParams.email_to_challenge, $scope.account, $routeParams.duo_username_to_challenge],
          [$routeParams.email, $routeParams.eth_account, $routeParams.duo_username]
        ],
        'proposal': [$routeParams.proposal_type,$routeParams.proposal_days,$routeParams.proposal_amount]
      }
      // console.log($scope.accept_challenge_form);
    }

    $scope.initiate_challenge = function (initiate_challenge_form) {
      // console.log(initiate_challenge_form);
      ChallengeFactory.initiateChallenge(initiate_challenge_form)
      .then(function (res){
        console.log(res);
      });
      $location.path('/Waiting');
    };

      $scope.counter_offer = function (counter_offer_form) {
        console.log(counter_offer_form);
        ChallengeFactory.counterOffer(counter_offer_form)
        .then(function (res){
            console.log(res);
            $location.path('/Waiting');
        });
    };

      $scope.accept_challenge = function (accept_challenge_form) {
        console.log(accept_challenge_form);
        // $scope.mint_challenge_token(accept_challenge_form);// execute on the back end
        ChallengeFactory.acceptChallenge(accept_challenge_form)
        .then(function (res){
          // if(!res.status) {
          //     $scope.error = res;
          //     console.log(res);
          // }
          console.log(res);
          $location.path('/ViewChallenge');
        });

    };
    $scope.fillCounterOfferForm();
    $scope.fillAcceptChallengeForm();

};
init();
}]);
