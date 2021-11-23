const BigNumber = require('bignumber.js');
const ChallengeToken = artifacts.require("ChallengeToken");
const keccak256 = require('keccak256');

contract("ChallengeToken", () => {
  it('Should deploy smart contract properly', async () => {
    const CT_Contract = await ChallengeToken.deployed();
    assert(CT_Contract.address !== '');
    console.log(CT_Contract.address);

  });
  it('Should generate challenge tokens', async () => {
    var test_accounts = ['0xfC9673Fe894607b431128d56680aFbcD6498d10A','0xa8716d909F11fd34D63ED0D1B38E6EBFE4f31770'];
    console.log("test accounts length: ", test_accounts.length);
    var nti = parseInt(test_accounts.length);
    var date = new Date("11/19/2021").toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const test_challenge = {
      playerList: [test_accounts[0],test_accounts[1]],
      name: "JollyLaMa1" + " : " + date,
      num_to_issue: nti,
      type: "Show Down(Streak)",
      streak_days: 10,
      stake_amount: 2
    }
    const CT_Contract = await ChallengeToken.deployed();
    const result = await CT_Contract.tokenGenesis(
      test_challenge.playerList,
       test_challenge.name,
        test_challenge.num_to_issue,
         date,
          test_challenge.type,
           test_challenge.streak_days,
            test_challenge.stake_amount,
             {from:test_accounts[0]}
    ).then(async (res) => {
      for (const [key,value] of Object.entries(res.receipt.logs[1].args)) {
          // console.log(key, " : ", value);
          switch(key){
              case "0":
                  console.log("Players: ");
                  value.forEach((currentValue, index, arr) => {
                    console.log(currentValue);
                    assert.equal(currentValue, test_challenge.playerList[index], "Players List returned is not matching!");
                  });
                  break;

              case "1":
                  assert.equal(value, test_challenge.name, "Name returned does not Match!");
                  break;

              case "2":
                  // ID should be the hash of the first initiator's DuoLingo name plus a space, a colon, a space, and the date/timestamp
                  // test_name = test_challenge.name + " : " + date;
                  // encoded_test_name = keccak256(Buffer.from(test_name, 'utf8'));
                  // var id = new BigNumber(encoded_test_name);
                  console.log(value);
                  assert(value, "ID was not returned!");
                  break;

              case "3":
                  assert(value, "Mint Data was not returned!");
                  break;

              default:
                break;
          }
      }
    });
    // console.log(result);

  });
  it('Should have a get function for challenge token collection length', async () => {
    const CT_Contract = await ChallengeToken.deployed();
    const result = await CT_Contract.getChallengeTokensLength();
    assert(result.length != null);
    console.log("Total Challenge Tokens Contracted: ", result.length);

  });

});
