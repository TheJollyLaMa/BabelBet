// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

library Challenges {
  struct Challenge {
    address [] players;
      string name;
        uint256 id;  // the id of the token issuance
         bytes mint_data;
          }
}
