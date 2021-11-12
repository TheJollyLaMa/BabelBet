pragma solidity >=0.4.21 <0.7.0;

library ChallengeTokens {
  struct Challenge {
    address payable owner;
     bytes uri;
      string name;
       string sym;
        uint256 id;  // the id of the token issuance
         bytes mint_data;
          }
}
