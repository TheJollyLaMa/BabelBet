var app = angular.module("ClientWebApp", ["ngRoute"]);
app.config([
  "$routeProvider",
  function($routeProvider) {
    $routeProvider

    .when("/", {controller: "ChallengeController", templateUrl: "Challenge/about.html"})
    .when("/About", {controller: "ChallengeController", templateUrl: "Challenge/about.html"})
    .when("/Dashboard", {controller: "ChallengeController", templateUrl: "Challenge/dashboard.html"})
    .when("/InitiateChallenge", {controller: "ChallengeController",templateUrl: "Challenge/initiate_challenge.html"})
    .when("/CounterOffer/:email/:email_to_challenge/:eth_account/:duo_username/:duo_username_to_challenge/:proposal_type/:proposal_days/:proposal_amount", {controller: "ChallengeController",templateUrl: "Challenge/counter_offer.html"})
    .when("/Accept/:email/:email_to_challenge/:eth_account/:duo_username/:duo_username_to_challenge/:proposal_type/:proposal_days/:proposal_amount", {controller: "ChallengeController",templateUrl: "Challenge/accept_offer.html"})
    .when("/Waiting", {controller: "ChallengeController",templateUrl: "Challenge/waiting.html"})
    .when("/ViewChallenge", {controller: "ChallengeController",templateUrl: "Challenge/view_challenge.html"})
    .when("/Login", {controller: "AuthController",templateUrl: "Login.html"})
    .when("/Logout", {resolve: {deadResolve: function ($location, AuthFactory) {AuthFactory.clearData(); $location.path('/Login'); } }})
    .when("/BehindTheCounter", {
      resolve: {check: function ($location, AuthFactory) {if (!AuthFactory.isUserLoggedIn()) {$location.path('/Login');}}},
      controller : "BehindTheCounterController",
      templateUrl : "BehindTheCounter/behind_the_counter.html"
    })
    .otherwise({redirectTo: "/"})
  }
]);
app.directive("bbnavbarchallenge",function(){
  return{
    data:{stock:"=",action:"&"},
    controller:"ChallengeController",
    replace:!0,
    restrict:"E",
    templateUrl:"Challenge/BBNavbarChallenge.html"
  };});
