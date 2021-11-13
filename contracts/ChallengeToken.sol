// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;
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
  address payable [] public Player_List;

  Challenges.Challenge[] public challenges;
  event ManifestedChallengeToken(address initiator,bytes _uri,string _ename,string _esym,uint256 _id,bytes mint_data);

    constructor()
    ERC1155("http://localhost:8888/public/#!/ChallengeTokenChest/{id}.json")
    Ownable()
    {}

  function tokenGenesis (string memory _ename,string memory _esym,uint256 _num_to_issue,
         string memory _mint_date,uint256 _stake_amount,uint256 _payout_coefficient,string memory _streak_days)
      public payable {
          OA.transfer(msg.value);
          uint256 idmod = 10 ** 16;
          uint256 token_id = uint256(keccak256(abi.encodePacked(_ename)));
          uint256 _id = token_id % idmod;
          require(!is_on_manifest[_id], "Err: Pick a Unique Challenge Name");
          is_on_manifest[_id] = true;
          Challenges.Challenge memory new_challenge;
          new_challenge.initiator = payable(msg.sender);
          new_challenge.name = _ename;
          new_challenge.sym = _esym;
          new_challenge.id = _id;
          bytes memory new_uri = abi.encode(_esym, "/", _id, ".json");
          new_challenge.uri = new_uri;
          bytes memory mintData = abi.encode(_num_to_issue, _mint_date, _stake_amount, _payout_coefficient, 1, _streak_days);
          new_challenge.mint_data = mintData;
          challenges.push(new_challenge);
          map_initiator_to_id[msg.sender] = _id;
          map_id_to_Challenge[_id] = new_challenge;
          _mint(msg.sender, _id, _num_to_issue, mintData);
          emit ManifestedChallengeToken(new_challenge.initiator,new_challenge.uri,new_challenge.name,new_challenge.sym,new_challenge.id,new_challenge.mint_data);
  }
  function getChallengeTokensLength() public view returns(uint256){
    return challenges.length;
  }
}
