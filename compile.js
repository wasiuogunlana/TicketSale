const fs = require('fs');
const solc = require('solc');
const path = require('path');
const inboxPath = path.resolve(__dirname, 'contracts', 'TicketSale.sol');
const source = fs.readFileSync(inboxPath, 'utf8');

let input = {
  language: "Solidity",
  sources: {
    "TicketSale.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

console.log('File compiled successfully.');
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contracts = output.contracts["TicketSale.sol"];
const contract=contracts['TicketSale'];
console.log(JSON.stringify(contract.abi));
module.exports= {"abi":contract.abi,"bytecode":contract.evm.bytecode.object};

