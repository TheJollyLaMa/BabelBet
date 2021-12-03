// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;
import "./ChallengeToken.sol";

contract CT_X is ChallengeToken {

  mapping(uint256 => mapping(address => uint256)) public map_player_to_payout;

  constructor()
   ChallengeToken()
  {}

  function changeStatusToReady() public {
    // function that changes status from 0 to 1
    // called from node watcher when one of the players meets the terms of the challenge.
    // signals the one day cooling period where other players are allowed to catch up
    // if they've been faithfully following along but are in different timezones or whatever

  }
  function payoutAndChangeStatus() public {
    //function to iterate through the players on the final payout list who met the terms of the challenge
    // After the 1 day cooldown period, those players are awarded their payout
    // and the 1155's status in the 'mint_data' variable is changed to '2' - or payed
  }
}
