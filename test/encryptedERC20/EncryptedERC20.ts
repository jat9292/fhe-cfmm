import { expect } from "chai";
import { ethers } from "hardhat";

import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { createTransaction, waitForBlock } from "../utils";
import { deployEncryptedERC20Fixture } from "./EncryptedERC20.fixture";

describe("EncryptedERC20", function () {
  before(async function () {
    this.signers = await getSigners(ethers);
  });

  beforeEach(async function () {
    const contract = await deployEncryptedERC20Fixture();
    this.contractAddress = await contract.getAddress();
    console.log("ERC20 ADDRESS  :  ", this.contractAddress);
    this.erc20 = contract;
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);
  });

  it("should transfer tokens between two users", async function () {
    let currentBlockNumber = await ethers.provider.getBlockNumber();
    await waitForBlock(BigInt(currentBlockNumber + 2), ethers); // to make sure to send next the following swap transactions in a single same block
    console.time("Encrypt Duration");
    const encryptedAmount = this.instances.alice.encrypt32(10000);
    console.timeEnd("Encrypt Duration");
    console.log("Encrypted amount : ", encryptedAmount);

    console.time("Mint tx Duration");
    const transaction = await createTransaction(this.erc20.mint, encryptedAmount);
    //await transaction.wait();
    console.timeEnd("Mint tx Duration");
    //await transaction.wait();
    console.time("Transfer tx Duration");
    const encryptedTransferAmount = this.instances.alice.encrypt32(1337);
    const tx = await createTransaction(
      this.erc20["transfer(address,bytes)"],
      this.signers.bob.address,
      encryptedTransferAmount,
    );
    await tx.wait();
    console.timeEnd("Transfer tx Duration");
  });
});
/*
    const tokenAlice = this.instances.alice.getTokenSignature(this.contractAddress)!;

    const encryptedBalanceAlice = await this.erc20.balanceOf(tokenAlice.publicKey, tokenAlice.signature);

    // Decrypt the balance
    const balanceAlice = this.instances.alice.decrypt(this.contractAddress, encryptedBalanceAlice);

    expect(balanceAlice).to.equal(10000 - 1337);

    const bobErc20 = this.erc20.connect(this.signers.bob);

    const tokenBob = this.instances.bob.getTokenSignature(this.contractAddress)!;

    const encryptedBalanceBob = await bobErc20.balanceOf(tokenBob.publicKey, tokenBob.signature);

    // Decrypt the balance
    const balanceBob = this.instances.bob.decrypt(this.contractAddress, encryptedBalanceBob);

    expect(balanceBob).to.equal(1337);/*
  });
});


/*
  it("should mint the contract", async function () {
    const encryptedAmount = this.instances.alice.encrypt32(1000);
    const transaction = await createTransaction(this.erc20.mint, encryptedAmount);
    await transaction.wait();
    // Call the method
    const token = this.instances.alice.getTokenSignature(this.contractAddress) || {
      signature: "",
      publicKey: "",
    };
    const encryptedBalance = await this.erc20.balanceOf(token.publicKey, token.signature);
    // Decrypt the balance
    const balance = this.instances.alice.decrypt(this.contractAddress, encryptedBalance);
    expect(balance).to.equal(1000);

    const encryptedTotalSupply = await this.erc20.getTotalSupply(token.publicKey, token.signature);
    // Decrypt the total supply
    const totalSupply = this.instances.alice.decrypt(this.contractAddress, encryptedTotalSupply);
    expect(totalSupply).to.equal(1000);
  });

  it("should transfer tokens between two users", async function () {
    const encryptedAmount = this.instances.alice.encrypt32(10000);
    const transaction = await createTransaction(this.erc20.mint, encryptedAmount);
    await transaction.wait();

    const encryptedTransferAmount = this.instances.alice.encrypt32(1337);
    const tx = await createTransaction(
      this.erc20["transfer(address,bytes)"],
      this.signers.bob.address,
      encryptedTransferAmount,
    );
    await tx.wait();

    const tokenAlice = this.instances.alice.getTokenSignature(this.contractAddress)!;

    const encryptedBalanceAlice = await this.erc20.balanceOf(tokenAlice.publicKey, tokenAlice.signature);

    // Decrypt the balance
    const balanceAlice = this.instances.alice.decrypt(this.contractAddress, encryptedBalanceAlice);

    expect(balanceAlice).to.equal(10000 - 1337);

    const bobErc20 = this.erc20.connect(this.signers.bob);

    const tokenBob = this.instances.bob.getTokenSignature(this.contractAddress)!;

    const encryptedBalanceBob = await bobErc20.balanceOf(tokenBob.publicKey, tokenBob.signature);

    // Decrypt the balance
    const balanceBob = this.instances.bob.decrypt(this.contractAddress, encryptedBalanceBob);

    expect(balanceBob).to.equal(1337);
  });
});

*/
