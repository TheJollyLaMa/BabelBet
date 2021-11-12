'use strict';

/*global app*/
app.controller('BehindTheCounterController', ['$scope', '$filter', '$window', 'InventoryFactory', function($scope, $filter, $window, InventoryFactory){
  var init = function() {
      $scope.title = 'Behind The Counter';
  }
  init();

}]);
