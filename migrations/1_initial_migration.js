const PokeCatcher = artifacts.require('PokeCatcher');

module.exports = function(deployer) {
  deployer.deploy(PokeCatcher);
};
