'use strict';

/*global app*/
app.factory('InventoryFactory', ['$http', function ($http) {
    return {
        showGreenInventory: showGreenInventory,
        showPackagedInventory: showPackagedInventory,
        showDiscountedInventory: showDiscountedInventory,
        showMerchandiseInventory: showMerchandiseInventory,
        addGreenInventory: addGreenInventory,
        addPackagedInventory: addPackagedInventory,
        addMerchandiseInventory: addMerchandiseInventory,
        updateInventoryAfterPurchase: updateInventoryAfterPurchase
    }
    function showGreenInventory () {
        var request = {method: 'GET', url: 'https://www.caffeinelamanna.com/php/get_green_inventory.php'};
        return $http(request).then(function(response) {
          return response.data;
        });
    }
    function showPackagedInventory () {
      var request = {method: 'GET', url: 'https://www.caffeinelamanna.com/php/get_packaged_inventory.php'};
      return $http(request).then(function(response) {
        return response.data;
      });
    }
    function showDiscountedInventory () {
      var request = {method: 'GET', url: 'https://www.caffeinelamanna.com/php/get_discounted_inventory.php'};
      return $http(request).then(function(response) {
        return response.data;
      });
    }
    function showMerchandiseInventory () {
      var request = {method: 'GET', url: 'https://www.caffeinelamanna.com/php/get_merchandise_inventory.php'};
      return $http(request).then(function(response) {
        return response.data;
      });
    }
    function addGreenInventory (newInventoryForm) {
      //console.log(newInventoryForm.reception_date);
      var request = {method: 'POST', url: 'https://www.caffeinelamanna.com/php/insert_into_Green_Inventory.php', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: 'origin='+newInventoryForm.origin+'&reception_date='+newInventoryForm.reception_date+'&weight='+newInventoryForm.weight+'&cost_per_lb='+newInventoryForm.cost_per_lb};
      return $http(request).then(function(response) {
        //console.log(response.data);
        return response;
      });
    }
    function addPackagedInventory (newPackagedForm) {
      var request = {method: 'POST', url: 'https://www.caffeinelamanna.com/php/insert_into_Packaged_Inventory.php', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: 'origin='+newPackagedForm.origin+'&weight='+newPackagedForm.weight+'&packaged_date='+newPackagedForm.packaged_date+'&roast_type='+newPackagedForm.roast_type};
      return $http(request).then(function(response) {
        return response;
      });
    }
    function addMerchandiseInventory (newMerchandiseForm) {
      var request = {method: 'POST', url: 'https://www.caffeinelamanna.com/php/insert_into_Merchandise_Inventory.php', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: 'sku='+newMerchandiseForm.sku+'&name='+newMerchandiseForm.name+'&description='+newMerchandiseForm.description+'&price='+newMerchandiseForm.price+'&quantity='+newMerchandiseForm.quantity+'&cost='+newMerchandiseForm.cost};
      return $http(request).then(function(response) {
        return response;
      });
    }
    function updateInventoryAfterPurchase (cart) {
      console.log(cart);
      var request = {method: 'POST', url: 'https://www.caffeinelamanna.com/php/update_inventory_after_purchase.php', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, data: 'cart='+cart};
      return $http(request).then(function(response) {
        return response;
      });
    }

}]);
