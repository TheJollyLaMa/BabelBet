'use strict';

/*global app*/
app.factory('ChallengeFactory', ['$http', function ($http) {
    return {
        initiateChallenge: initiateChallenge,
        counterOffer: counterOffer,
        acceptChallenge: acceptChallenge
      }
      function initiateChallenge (form) {
          var request = {method: 'POST', url: '/InitiateChallenge/', data: form, headers: {ContentType:'application/json'}};
          return $http(request).then(function(response) {
            console.log(response);
            return response.data;
          });
      }
      function counterOffer (form) {
          var request = {method: 'POST', url: '/CounterOffer/', data: form, headers: {ContentType:'application/json'}};
          return $http(request).then(function(response) {
            console.log(response);
            return response.data;
          });
      }
      function acceptChallenge (form) {
          var request = {method: 'POST', url: '/Accept/', data: form, headers: {ContentType:'application/json'}};
          return $http(request).then(function(response) {
            return response.data;
          });
      }
}]);
