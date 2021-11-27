// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;
pragma abicoder v2;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Challenge.sol";

contract ChallengeToken is ERC1155, Ownable{
   /* Stored on chain */
  mapping (uint256 => bool) public is_on_manifest;
  mapping (address => uint256) public map_initiator_to_id;
  mapping (uint256 => Challenges.Challenge) public map_id_to_Challenge;

  address payable public OA = payable(msg.sender);
  address payable public CT_X_Address;
  mapping (uint256 => mapping(address => uint256)) public Player_Map;

  Challenges.Challenge[] public challenges;
  event ManifestedChallengeToken(address [] players,string _name,uint256 _id,bytes mint_data);

    constructor()
    ERC1155("http://localhost:8888/public/#!/ChallengeTokenChest/{id}.json")
    Ownable()
    {}
  function tokenGenesis (
    address [] memory _player_list,
     string memory _name,
      uint256 _num_to_issue,
       string memory _mint_date,
        string memory _type,
         uint256 _streak_days,
          uint256 _stake_amount
  )public
   returns (uint256) {
      // OA.transfer(msg.value);
      uint256 idmod = 10 ** 16;
      uint256 token_id = uint256(keccak256(abi.encodePacked('_name')));
      uint256 _id = token_id % idmod;
      require(!is_on_manifest[_id], "Err: Pick a Unique Challenge Name");
      Challenges.Challenge memory new_challenge;
      new_challenge.players = _player_list;
      new_challenge.name = _name;
      new_challenge.id = _id;
      bytes memory mintData = abi.encode(_mint_date, _type, _streak_days, _stake_amount);
      new_challenge.mint_data = mintData;
      challenges.push(new_challenge);
      map_initiator_to_id[msg.sender] = _id;
      map_id_to_Challenge[_id] = new_challenge;
      is_on_manifest[_id] = true;
      _mint(msg.sender, _id, _num_to_issue, mintData);
      for(uint i=0; i <= _player_list.length ; i++){
        if(msg.sender != _player_list[i]){
          setApprovalForAll(_player_list[i], true);
          safeTransferFrom(msg.sender, _player_list[i], _id, 1, mintData);
          break;
        }
      }
      emit ManifestedChallengeToken(new_challenge.players,new_challenge.name,new_challenge.id,new_challenge.mint_data);
      return _id;
  }
  function getChallenges() public view returns (Challenges.Challenge[] memory) {
        Challenges.Challenge[] memory c = new Challenges.Challenge[](challenges.length);
        for (uint i = 0; i < challenges.length; i++) {
          Challenges.Challenge storage this_challenge = challenges[i];
          c[i] = this_challenge;
        }
        return c;
    }

  function getChallengeTokensLength() public view returns(uint256){
    return challenges.length;
  }
}
