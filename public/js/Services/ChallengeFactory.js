'use strict';

/*global app*/
app.factory('ChallengeFactory', ['$http', function ($http) {
    return {
        initiateChallenge: initiateChallenge,
        counterChallenge: counterChallenge,
        acceptChallenge: acceptChallenge
      }
      function initiateChallenge (form) {
          var request = {method: 'POST', url: '/InitiateChallenge/', data: form, headers: {ContentType:'application/json'}};
          return $http(request).then(function(response) {
            return response.data;
          });
      }
      function counterChallenge (form) {
          var request = {method: 'POST', url: '/CounterOffer/', data: form, headers: {ContentType:'application/json'}};
          return $http(request).then(function(response) {
            return response.data;
          });
      }
      function acceptChallenge (form) {
          var request = {method: 'POST', url: '/Stake/', data: form, headers: {ContentType:'application/json'}};
          return $http(request).then(function(response) {
            return response.data;
          });
      }
}]);
