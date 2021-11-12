pragma solidity >=0.4.21 <0.7.0;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import "./ChallengeToken.sol";

contract DualOlingO is ERC1155, Ownable{
//   /* State variables are stored in the blockchain */
  mapping(uint256 => bool) public is_on_manifest;
  mapping (address => uint256) public map_initiator_to_id;
  mapping (uint256 => Alms.Alm) public map_id_to_Alm;

  address payable public OA = msg.sender;
  address payable public AT_X_address;
  mapping(uint256 => mapping(address => uint256)) public Player_Map;
  address payable [] public Player_List;

  ChallengeTokens.Challenge[] public challenges;
  event ManifestedChallengeToken(address initiator,bytes _uri,string _ename,string _esym,uint256 _id,bytes mint_data);

  constructor()
    ERC1155("http://localhost:8888/public/#!/ChallengeTokenChest/{id}.json")
      Ownable()
          public {
          }

   function tokenGenesis (string memory _ename,string memory _esym,uint256 _num_to_issue,
         string memory _mint_date,uint256 _stake_amount,uint256 _payout_coefficient,string memory _streak_days)
      public payable {
          OA.transfer(msg.value);
          uint256 idmod = 10 ** 16;
          uint256 token_id = uint256(keccak256(abi.encodePacked(_ename)));
          uint256 _id = token_id % idmod;
          require(!is_on_manifest[_id], "Err: Pick a Unique Challenge Name");
          is_on_manifest[_id] = true;
          ChallengeTokens.Challenge memory new_challenge;
          new_challenge.initiator = msg.sender;
          new_challenge.name = _ename;
          new_challenge.sym = _esym;
          new_challenge.id = _id;
          bytes memory new_uri = abi.encode(_esym, "/", _id, ".json");
          new_challenge.uri = new_uri;
          bytes memory mintData = abi.encode(_num_to_issue, _mint_date, _cost, _angel_coefficient, 1, _product);
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
//   function buyAlms(address payable _owner, uint256 _id, uint256 _amount, uint256 _cost, bytes memory _data) public payable returns(address){
//       require(msg.value >= (_cost * _amount), "Err: not enough eth sent, No Soup For You!");
//       require(balanceOf(_owner, _id) >= _amount, "Err: not enough tokens to fill your order!");
//       // uint256 OA_share = msg.value - (_amount/1000);
//       // _owner.transfer(msg.value - OA_share);
//       OA.transfer(_cost*_amount/1000);
//       safeTransferFrom(_owner, msg.sender, _id, _amount, _data);
//       Angel_Map[_id][msg.sender] += _amount;
//       Angel_List.push(msg.sender);
//       if(balanceOf(_owner, _id) == 0) {
//         Alms.Alm memory alm_to_x = map_id_to_Alm[_id];
//         uint256 _num_issued;
//         (_num_issued) = abi.decode(alm_to_x.mint_data,(uint256));
//         AT_X_address.transfer(_num_issued * _cost);
//       }
//       return msg.sender;
//   }
}
