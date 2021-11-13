app.factory('BlockFactory', ["$http", function ($http) {
    return {
          FetchTokenJSON: FetchTokenJSON,
          FetchCT_X_JSON: FetchCT_X_JSON
      }
      function FetchTokenJSON () {
          return $http.get('../../../abis/ChallengeToken.json')// ../../../abis/AngelToken.json needs to change to hardlink (https://ipfs.io/ipfs/QmckjBCtjqQRUSB1dxqpwa9gLhLryhba2aynHmDWTdCqK6/AngelToken.json) to ipfs file containing token ABI
                      .then(function(ctjson) {
                        return ctjson.data;
                      });
      }
      function FetchCT_X_JSON () {
          return $http.get('../../../abis/CT_X.json')// ../../../abis/AT_X.json change to IPFS token execution abi (https://ipfs.io/ipfs/QmckjBCtjqQRUSB1dxqpwa9gLhLryhba2aynHmDWTdCqK6/AT_X.json)
                      .then(function(ctxjson) {
                        return ctxjson.data;
                      });
      }

}]);
