
const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { abi, bytecode } = require('../compile');

let accounts;
let ticketSale;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    ticketSale = await new web3.eth.Contract(abi)
        .deploy({
            data: bytecode,
            arguments: [10, 100],
        })
        .send({ from: accounts[0], gasPrice: "1000000000", gas: 2000000 });
});

describe("TicketSale Contract", () => {
    it("deploy TicketSale contract", () => {
        assert.ok(ticketSale.options.address);
    });

    it("allow purchasing a ticket", async () => {
        const ticketId = 1; 
        await ticketSale.methods.buyTicket(ticketId).send({
            from: accounts[1],
            value: 100,
        });

        const ticketStatus = await ticketSale.methods.ticketStatus(ticketId).call();
        const ticketOwner = await ticketSale.methods.ticketOf(accounts[1]).call();

        assert.strictEqual(ticketStatus, "1"); 
        assert.strictEqual(Number(ticketOwner), ticketId);
    });

    it("return correct ticket of an address", async () => {
        const ticketId = 2;
        await ticketSale.methods.buyTicket(ticketId).send({
            from: accounts[2],
            value: 100,
        });

        const result = await ticketSale.methods.getTicketOf(accounts[2]).call();

        assert.strictEqual(Number(result), ticketId);
    });

    it("accept a swap", async () => {
    const ticketId_1 = 3;
    const ticketId_2 = 4;
    await ticketSale.methods.buyTicket(ticketId_1).send({
        from: accounts[3],
        value: 100,
    });
    await ticketSale.methods.buyTicket(ticketId_2).send({
        from: accounts[4],
        value: 100,
    });

    await ticketSale.methods.offerSwap(accounts[4]).send({
        from: accounts[3],
    });
    await ticketSale.methods.acceptSwap(accounts[3]).send({
        from: accounts[4],
    });
    const ownerOfTicket1 = await ticketSale.methods.ticketOf(accounts[3]).call();
    const ownerOfTicket2 = await ticketSale.methods.ticketOf(accounts[4]).call();

    assert.strictEqual(Number(ownerOfTicket1), ticketId_2);
    assert.strictEqual(Number(ownerOfTicket2), ticketId_1);
   
});

it("return a ticket and get a refund", async () => {
    const ticketId = 1;
    await ticketSale.methods.buyTicket(ticketId).send({
        from: accounts[1],
        value: 100,
    });

    await ticketSale.methods.returnTicket(accounts[1]).send({
        from: accounts[1],
    });

    const ticketStatus = await ticketSale.methods.ticketStatus(ticketId).call();
    const ticketOwner = await ticketSale.methods.ticketOf(accounts[1]).call();
    const ownerBalance = await web3.eth.getBalance(accounts[0]);

    assert.strictEqual(ticketStatus, "2"); 
    assert.strictEqual(Number(ticketOwner), 0); 
    assert.strictEqual(ownerBalance > 0, true); 
});

});





