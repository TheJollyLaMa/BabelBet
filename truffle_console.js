let ct = await ChallengeToken.deployed();
let accounts = await web3.eth.getAccounts();
let PlayerList = [accounts[0],accounts[1]];

challenge1 = await ct.tokenGenesis(PlayerList,'test',2,'20211115 2219.23.323122','ShowDown(Streak)',108,108, {from: accounts[0], gas: 3000000}).then((id)=>{console.log(id);});
challenge2 = await ct.tokenGenesis(PlayerList,'test2',2,'20211115 2219.23.323122','ShowDown(Streak)',216,216, {from: accounts[0], gas: 3000000}).then((id)=>{console.log(id);});
challenge3 = await ct.tokenGenesis(PlayerList,'test3',2,'20211115 2219.23.323122','ShowDown(Streak)',216,216, {from: accounts[0], gas: 3000000}).then((id)=>{console.log(id);});

var challenges_minted = await ct.getChallengeTokensLength().then((length)=>{console.log(length); return length.words[0]});


ct.challenges(0);
ct.challenges(1);
ct.challenges(2);

map_initiator_to_id


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
