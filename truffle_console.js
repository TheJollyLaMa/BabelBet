let ct = await ChallengeToken.deployed();
let accounts = await web3.eth.getAccounts();
let Player_Eth_Addr_List = [accounts[0],accounts[1]];
var Player_Email_Addr_List = ['boyyee44@gmail.com','solarmail888@gmail.com'];

var Player_Duo_Info_List = [my_duo_name+"::"+my_duo_pass,yo_duo_name+"::"+yo_duo_pass];

var challenge1 = await ct.tokenGenesis(Player_Eth_Addr_List,'test1 : 20211115',2,'20211115 2219.23.323122','ShowDown(Streak)',108,1, {from: accounts[0], gas: 3000000}).then((id)=>{console.log(id);return id;});
var challenge2 = await ct.tokenGenesis(Player_Eth_Addr_List,'test2 : 20211016',2,'20211116 2219.23.323122','ShowDown(Streak)',216,2, {from: accounts[0], gas: 3000000}).then((id)=>{console.log(id);return id;});
var challenge3 = await ct.tokenGenesis(Player_Eth_Addr_List,'test3 : 20211101',2,'20211101 2219.23.323122','ShowDown(Streak)',4,3, {from: accounts[0], gas: 3000000}).then((id)=>{console.log(id);return id;});

var challenges_minted = await ct.getChallengeTokensLength().then((length)=>{console.log(length); return length.words[0]});
// rerun after every token add to get the updated list! drop the 'var' or it will throw error regarding reassignment
var challenges = await ct.getChallenges().then((res)=>{return res;});
// get the first challenge id
var challenge_1_id = Number(challenges[0][2]);
var challenge_2_id = Number(challenges[1][2]);
var challenge_3_id = Number(challenges[2][2]);
// update the email map for a token
await ct.update_Token_Player_Email_Map(challenge_1_id, Player_Eth_Addr_List, Player_Email_Addr_List);
await ct.update_Token_Player_Duo_Map(challenge_1_id, Player_Eth_Addr_List, Player_Duo_Info_List);
await ct.update_Token_Player_Email_Map(challenge_2_id, Player_Eth_Addr_List, Player_Email_Addr_List);
await ct.update_Token_Player_Duo_Map(challenge_2_id, Player_Eth_Addr_List, Player_Duo_Info_List);
await ct.update_Token_Player_Email_Map(challenge_3_id, Player_Eth_Addr_List, Player_Email_Addr_List);
await ct.update_Token_Player_Duo_Map(challenge_3_id, Player_Eth_Addr_List, Player_Duo_Info_List);
var challenge_1_recall = await ct.map_id_to_Challenge(challenge_1_id);
var email01 = ct.fetch_Email_By_Id_And_EthAddr(challenge_1_id,accounts[0]);
var email02 = ct.fetch_Email_By_Id_And_EthAddr(challenge_1_id,accounts[1]);
var duo01 = ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_1_id,accounts[0]);
var duo02 = ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_1_id,accounts[1]);
var email11 = ct.fetch_Email_By_Id_And_EthAddr(challenge_2_id,accounts[0]);
var email12 = ct.fetch_Email_By_Id_And_EthAddr(challenge_2_id,accounts[1]);
var duo11 = ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_2_id,accounts[0]);
var duo12 = ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_2_id,accounts[1]);
var email21 = ct.fetch_Email_By_Id_And_EthAddr(challenge_3_id,accounts[0]);
var email22 = ct.fetch_Email_By_Id_And_EthAddr(challenge_3_id,accounts[1]);
var duo21 = ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_3_id,accounts[0]);
var duo22 = ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_3_id,accounts[1]);
ct.challenges(0);
ct.challenges(1);
ct.challenges(2);

// map_initiator_to_id


  // await challenges_arr.append(ct.challenges(i));
// }


// challenge1_ID = challenges

//
// let OA = await ct.OA.call();
//
//
//
//
// chalBalAcc1 = await ct.balanceOf(PlayerList[0])
// chalBalAcc2 = await ct.balanceOf(PlayerList[1])
