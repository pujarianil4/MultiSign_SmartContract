

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Multisig",  function () {
  let wallet, owner, addr1, addr2;

  beforeEach(async () => {
     [owner, addr1, addr2] = await ethers.getSigners();
    const Multisig = await ethers.getContractFactory("Multisig");
     wallet = await Multisig.deploy([owner.address ,addr1.address, addr2.address], 2, {value: ethers.utils.parseEther("10")});
    await wallet.deployed();

  });

  it("Should have correct approvers and threshold", async function () {
 
    const approvers_0 = await wallet.approvers(0);
    const approvers_1 = await wallet.approvers(1);
    const approvers_2 = await wallet.approvers(2);
    const threshold = await wallet.threshold();
    expect(threshold).to.equal(2);
    expect(approvers_0).to.equal(owner.address);
    expect(approvers_1).to.equal(addr1.address);
    expect(approvers_2).to.equal(addr2.address);
  });

  it("Should create Transaction correctly", async function() {
    const tx = await wallet.createTransaction(addr1.address, 1 ** 18 );
    expect(tx.value).to.equal(0);
  })

  it("Should create transation and get transaction ", async function() {
      const add = addr1.address;
      const value = 1 ** 18;
    const tx = await wallet.createTransaction(add, value );
    expect(tx.value).to.equal(0);
    const tx_0 = await wallet.getTransaction(tx.value);
    expect(tx_0.id).to.equal(tx.value);
    expect(tx_0.amount).to.equal(value);
    expect(tx_0.to).to.equal(add);
    expect(tx_0.approvals).to.equal(0);
    expect(tx_0.isTransfred).to.equal(false);
  })

  it("Should create transation and get transaction and add approvals", async function() {
    const add = addr1.address;
    const value = 1 ** 18;
  const tx = await wallet.createTransaction(add, value );
  expect(tx.value).to.equal(0);
  const beforeApproval = await wallet.getTransaction(tx.value);
  expect(beforeApproval.approvals).to.equal(0);

   await wallet.addApprover(tx.value);
   const afterApproval_1 = await wallet.getTransaction(tx.value);
  expect(afterApproval_1.approvals).to.equal(1);
 
  await wallet.connect(addr1).addApprover(tx.value);
  const afterApproval_2 = await wallet.getTransaction(tx.value);
  expect(afterApproval_2.approvals).to.equal(2);
})

it("Should send transaction correctly", async function() {
    const add = addr1.address;
    const value = 1 ** 18;
  const tx = await wallet.createTransaction(add, value );
  expect(tx.value).to.equal(0);
  const beforeApproval = await wallet.getTransaction(tx.value);
  expect(beforeApproval.approvals).to.equal(0);

   await wallet.addApprover(tx.value);
   const afterApproval_1 = await wallet.getTransaction(tx.value);
  expect(afterApproval_1.approvals).to.equal(1);
 
  await wallet.connect(addr1).addApprover(tx.value);
  const afterApproval_2 = await wallet.getTransaction(tx.value);
  expect(afterApproval_2.approvals).to.equal(2);

  await wallet.sendTransfer(tx.value);
    const afterTransfer = await wallet.getTransaction(tx.value);
    expect(afterTransfer.isTransfred).to.equal(true);
})

  it("should have balance", async function() {
    const balance = await wallet.getBalance();
     expect(balance).to.equal("10000000000000000000");
  })
});
