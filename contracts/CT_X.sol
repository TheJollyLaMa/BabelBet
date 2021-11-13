// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;
import "./ChallengeToken.sol";

contract CT_X is ChallengeToken {

  mapping(uint256 => mapping(address => uint256)) public map_player_to_payout;

  constructor()
   ChallengeToken()
    {}


}
