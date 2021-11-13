// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

library Challenges {
  struct Challenge {
    address payable initiator;
     bytes uri;
      string name;
       string sym;
        uint256 id;  // the id of the token issuance
         bytes mint_data;
          }
}
