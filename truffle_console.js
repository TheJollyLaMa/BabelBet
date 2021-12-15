// control k t      to toggle TODO list
// https://www.youtube.com/redirect?event=live_chat&redir_token=QUFFLUhqbGhlRUUwdXRSTkpnWUhVZXQ1WGJBYnFMRlE1QXxBQ3Jtc0ttNGE5LUFDN2xldEZUYXk2bEVnNXBsY0NFZ3E2Nlo1a0hYN1pHUUVHRnJKRVFQR3E3VkNncDB6WTBNSldJZ1lnOU5oMTlNN285SmRkSXg1RnBNMmJtOUFOYXNWcjhEX0E0c2pDR01uejJYNzl3QnVPVQ&q=https%3A%2F%2Fmintgate.gitbook.io%2Fmintgate-docs%2Fset-up-token-access%2Flist-of-supported-platforms
// ​discord.gg/HVsbWZfrFQ
// MintGate Bounty - create a drop in UI that checks if a user owns an NFT
// Gate the challenge token view so only users can see the challenge stats.
// there is already a dapp called "unlock" that alows the same but you have to use their platform to mint the NFT that is used as the key or Password
// what MintGate did was out cryptonerd the cryptonerds.  Unlock comes in and captures as much market share as they can by making their platform and tech exclusive
// MintGate comes behind them, sees the opensourced, decentralized, and freely/widely distributed code and tweaks it to get their foot in the door
// The point is, in a decentralized, opensourced innovation field, you have to learn to move on.  Proprietary rights are how you get your startup funded - it is not how you preserve value!!!!
//  As of right now, to preserve value on the blockchain, you have to be ready to innovate and spread out.
// Create something new that will grab 1 million people, spread out the winnings to create a positive user experience, and hand it over to a DOA.  That is the model for success in this climate.
// added truffle_console.js for dev progress by program command
//Command Control Space brings up an emoji menu when typing on the newer MacOS

let ct = await ChallengeToken.deployed();
let accounts = await web3.eth.getAccounts();
let Player_Eth_Addr_List = await [accounts[0],accounts[2]];
var Player_Email_Addr_List = ['',''];
var my_duo_name = "";
var yo_duo_name = "";
var my_duo_pass = "";
var yo_duo_pass = "";
var Player_Duo_Info_List = [my_duo_name+"::"+my_duo_pass,yo_duo_name+"::"+yo_duo_pass];

var challenge1 = await ct.tokenGenesis(Player_Eth_Addr_List,'test1 : 20211115',2,'20211115 2219.23.323122','ShowDown(Streak)',108,1, {from: accounts[0], value: web3.utils.toWei('2', 'ether'), gas: 3000000}).then((id)=>{console.log(id);return id;});
var challenge2 = await ct.tokenGenesis(Player_Eth_Addr_List,'test2 : 20211016',2,'20211116 2219.23.323122','ShowDown(Streak)',216,2, {from: accounts[0], value: web3.utils.toWei('4', 'ether'), gas: 3000000}).then((id)=>{console.log(id);return id;});
var challenge3 = await ct.tokenGenesis(Player_Eth_Addr_List,'test3 : 20211101',2,'20211101 2219.23.323122','ShowDown(Streak)',4,3, {from: accounts[0], value: web3.utils.toWei('6', 'ether'), gas: 3000000}).then((id)=>{console.log(id);return id;});

var challenges = await ct.getChallenges().then((res)=>{return res;});

var challenge_1_id = await Number(challenges[0][2]);
var challenge_2_id = await Number(challenges[1][2]);
var challenge_3_id = await Number(challenges[2][2]);
// var challenges_minted = await ct.getChallengeTokensLength().then((length)=>{console.log(length); return length.words[0]});
// var OA_Balance = await web3.eth.getBalance(accounts[0]);
// update the email map for a token
// var challenge_1_recall = await ct.map_id_to_Challenge(challenge_1_id);
await ct.update_Token_Player_Email_Map(challenge_1_id, Player_Eth_Addr_List, Player_Email_Addr_List);
await ct.update_Token_Player_Duo_Map(challenge_1_id, Player_Eth_Addr_List, Player_Duo_Info_List);
await ct.update_Token_Player_Email_Map(challenge_2_id, Player_Eth_Addr_List, Player_Email_Addr_List);
await ct.update_Token_Player_Duo_Map(challenge_2_id, Player_Eth_Addr_List, Player_Duo_Info_List);
await ct.update_Token_Player_Email_Map(challenge_3_id, Player_Eth_Addr_List, Player_Email_Addr_List);
await ct.update_Token_Player_Duo_Map(challenge_3_id, Player_Eth_Addr_List, Player_Duo_Info_List);

var email01 = await ct.fetch_Email_By_Id_And_EthAddr(challenge_1_id,Player_Eth_Addr_List[0]);
var email02 = await ct.fetch_Email_By_Id_And_EthAddr(challenge_1_id,Player_Eth_Addr_List[1]);
var duo01 = await ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_1_id,Player_Eth_Addr_List[0]);
var duo02 = await ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_1_id,Player_Eth_Addr_List[1]);
var email11 = await ct.fetch_Email_By_Id_And_EthAddr(challenge_2_id,Player_Eth_Addr_List[0]);
var email12 = await ct.fetch_Email_By_Id_And_EthAddr(challenge_2_id,Player_Eth_Addr_List[1]);
var duo11 = await ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_2_id,Player_Eth_Addr_List[0]);
var duo12 = await ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_2_id,Player_Eth_Addr_List[1]);
var email21 = await ct.fetch_Email_By_Id_And_EthAddr(challenge_3_id,Player_Eth_Addr_List[0]);
var email22 = await ct.fetch_Email_By_Id_And_EthAddr(challenge_3_id,Player_Eth_Addr_List[1]);
var duo21 = await ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_3_id,Player_Eth_Addr_List[0]);
var duo22 = await ct.fetch_Duo_Info_By_Id_And_EthAddr(challenge_3_id,Player_Eth_Addr_List[1]);

var payout_amount3 = web3.utils.toWei("3");
var ct_Eth_Balance_before = await web3.eth.getBalance(ct.address);
var player1_Eth_Balance_before = await web3.eth.getBalance(Player_Eth_Addr_List[0]);
var player2_Eth_Balance_before = await web3.eth.getBalance(Player_Eth_Addr_List[1]);
// TODO: function call works like butter in truffle! But not in node server. Getting closer ....
if (ct_Eth_Balance >= (Player_Eth_Addr_List.length * payout_amount3){
   await ct.babelBet_Payout(Player_Eth_Addr_List, challenge_3_id, payout_amount3);
}
var ct_Eth_Balance_after = await web3.eth.getBalance(ct.address);
var player1_Eth_Balance_after = await web3.eth.getBalance(Player_Eth_Addr_List[0]);
var player2_Eth_Balance_after = await web3.eth.getBalance(Player_Eth_Addr_List[1]);

ct_Eth_Balance_after
ct_Eth_Balance_before
ct_Eth_Balance_after-ct_Eth_Balance_before

player1_Eth_Balance_after
player1_Eth_Balance_before
player1_Eth_Balance_after-player1_Eth_Balance_before

player2_Eth_Balance_after
player2_Eth_Balance_before
player2_Eth_Balance_after-player2_Eth_Balance_before

var tx_res = await web3.eth.sendTransaction({from: accounts[3], to: ct.address, value: await web3.utils.toWei('20')}).then(res=>{return res;});


// ct.challenges(0);
// ct.challenges(1);
// ct.challenges(2);
