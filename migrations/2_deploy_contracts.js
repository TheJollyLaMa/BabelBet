const ChallengeToken = artifacts.require("ChallengeToken");
const CT_X = artifacts.require("CT_X");

module.exports = function(deployer, network, accounts) {
  // console.log(accounts);
  // var date = new Date("01/01/2021").toLocaleDateString('en-US', {
  //   day: '2-digit',
  //   month: '2-digit',
  //   year: 'numeric',
  // })
  // const original_alm = {
  //   endeavor_name: "Original Angel",
  //   endeavor_symbol : "OA",
  //   issue_num : 100,
  //   mint_date : date,
  //   cost : 1,
  //   angel_coefficient : 0001,
  //   product : "1/2lb Shit from Healthy Bull"
  // }
  // var ct = {'CT_X_Address':''};
  try{
    deployer.deploy(ChallengeToken).then(async function(){
      ct = await ChallengeToken.deployed();
      console.log(ct.address);
      // at.tokenGenesis(
      //  original_alm.endeavor_name,
      //   original_alm.endeavor_symbol,
      //    original_alm.issue_num,
      //     String(original_alm.mint_date),
      //      original_alm.cost,
      //       original_alm.angel_coefficient,
      //        original_alm.product
      // );
    });
    var ct_x = deployer.deploy(CT_X)
    .then(async () => {
        var c = await CT_X.deployed();
        console.log(c.address);
        return c;
      });
      // console.log(ct_x.address);
    // ct.CT_X_Address = ct_x.address;
    // console.log(ct.CT_X_Address);

  }catch(err){
    console.log(err);
  }
};
