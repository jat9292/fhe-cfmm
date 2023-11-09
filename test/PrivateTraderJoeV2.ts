import { expect } from "chai";
import { ethers } from "hardhat";

import { createInstances } from "./instance";
import { getSigners } from "./signers";
import { createTransaction, waitForBlock } from "./utils";

describe("Confidential TraderJoeV2", function () {
  before(async function () {
    this.signers = await getSigners(ethers);
  });

  it("Confidential TraderJoeV2 Pool sell tokenA", async function () {
    const signers = await getSigners(ethers);
    const aliceAddress = await signers.alice.getAddress();
    const bobAddress = await signers.bob.getAddress();
    const carolAddress = await signers.carol.getAddress();
    const tokenFactory = await ethers.getContractFactory("EncryptedERC20");

    let tokenA = await tokenFactory.deploy("EncTokenA", "ETA");
    await tokenA.waitForDeployment();
    let tokenAAddress = await tokenA.getAddress();

    let tokenB = await tokenFactory.deploy("EncTokenB", "ETB");
    await tokenB.waitForDeployment();
    let tokenBAddress = await tokenB.getAddress();

    let temp;
    let temp2;
    if (tokenAAddress > tokenBAddress) {
      // impose correct order : tokenA=token0 and tokenB=token1 for more readable test
      temp = tokenAAddress;
      tokenAAddress = tokenBAddress;
      tokenBAddress = temp;
      temp2 = tokenA;
      tokenA = tokenB;
      tokenB = temp2;
    }

    console.log("EncryptedERC20 TOKENA ADDRESS  :  ", tokenAAddress);
    console.log("EncryptedERC20 TOKENB ADDRESS  :  ", tokenBAddress);

    const instancesTokenA = await createInstances(tokenAAddress, ethers, signers);
    const instancesTokenB = await createInstances(tokenBAddress, ethers, signers);

    // ALICE mints 4294967295 tokenA and 4294967295 tokenB
    let encryptedAmount = instancesTokenA.alice.encrypt32(2147483647); // supply is type(uint32).max/2
    const tx1 = await tokenA.mint(encryptedAmount);
    const tx1receipt = await tx1.wait();
    console.log("Gas consumed by 1st mint tx : ", tx1receipt?.gasUsed);
    const tx2 = await tokenB.mint(encryptedAmount);
    await tx2.wait();

    console.log("Alice succesfully minted 2147483647 EncryptedtokenA and 2147483647 EncryptedtokenB");

    // ALICE deploys the Uniswap Factory
    const uniswapFactoryFactory = await ethers.getContractFactory("TraderJoeV2FactoryEncrypted");
    const uniswapFactory = await uniswapFactoryFactory.connect(signers.alice).deploy();
    await uniswapFactory.waitForDeployment();
    const uniswapFactoryAddress = await uniswapFactory.getAddress();
    console.log("UNISWAP FACTORY ADDRESS  :  ", uniswapFactoryAddress);

    encryptedAmount = instancesTokenA.alice.encrypt32(1000000000);
    await tokenA.approve(uniswapFactoryAddress, encryptedAmount);
    encryptedAmount = instancesTokenB.alice.encrypt32(1000000000);
    const tx4 = await tokenB.approve(uniswapFactoryAddress, encryptedAmount);
    await tx4.wait();

    console.log("TX4");

    // ALICE creates the tokenA/tokenB Uniswap pool
    const instancesUniswapFactory = await createInstances(uniswapFactoryAddress, ethers, signers);
    let encryptedAmountA = instancesUniswapFactory.alice.encrypt32(100001);
    let encryptedAmountB = instancesUniswapFactory.alice.encrypt32(100001);

    const tx5 = await uniswapFactory.createPair(
      aliceAddress,
      tokenAAddress,
      tokenBAddress,
      encryptedAmountA,
      encryptedAmountB,
      1000000,
      10,
    );
    await tx5.wait();
    const pairAddress = await uniswapFactory.getPair(tokenAAddress, tokenBAddress);
    console.log("UNISWAP PAIR ADDRESS : ", pairAddress);

    let tokenAAlice = instancesTokenA.alice.getTokenSignature(tokenAAddress)!;
    let tokenBAlice = instancesTokenB.alice.getTokenSignature(tokenBAddress)!;
    let encryptedBalAAlice = await tokenA["balanceOf(bytes32,bytes)"](tokenAAlice.publicKey, tokenAAlice.signature);
    let balanceAAlice = instancesTokenA.alice.decrypt(tokenAAddress, encryptedBalAAlice);
    console.log("balance EncryptedtokenA Alice ", balanceAAlice);

    // ALICE add the first amount of liquidity in the pool
    const currentTime = (await ethers.provider.getBlock("latest"))?.timestamp ?? 0;

    encryptedAmountA = instancesUniswapFactory.alice.encrypt32(100000000);
    encryptedAmountB = instancesUniswapFactory.alice.encrypt32(100000000);
    const tx6 = await uniswapFactory.addLiquidity(
      tokenAAddress,
      tokenBAddress,
      encryptedAmountA,
      encryptedAmountB,
      Array(11).fill(10000000),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], //11,12,13,14,15,16,17,18,19,20],
      aliceAddress,
      currentTime + 120,
      { gasLimit: 10000000 },
    );
    await tx6.wait(1);

    const tx6bis = await uniswapFactory.addLiquidity(
      tokenAAddress,
      tokenBAddress,
      encryptedAmountA,
      encryptedAmountB,
      Array(10).fill(10000000),
      [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      aliceAddress,
      currentTime + 180,
      { gasLimit: 10000000 },
    );
    await tx6bis.wait(1);

    const pair = await ethers.getContractAt("ZNEWUniswapV2PairEncrypted", pairAddress);
    let balLP = [];
    for (let i = 0; i < 21; i++) {
      balLP.push(await pair.totalSupply(i));
    }
    console.log(balLP);

    let activeBin = await pair.activeBin();
    console.log(activeBin);

    encryptedAmountA = instancesUniswapFactory.alice.encrypt32(100000000);
    encryptedAmountB = instancesUniswapFactory.alice.encrypt32(100000000);
    const tx7 = await tokenA.approve(uniswapFactoryAddress, encryptedAmountA);
    const tx8 = await tokenB.approve(uniswapFactoryAddress, encryptedAmountB);
    await tx8.wait();
    console.log("TX8");

    encryptedBalAAlice = await tokenA["balanceOf(bytes32,bytes)"](tokenAAlice.publicKey, tokenAAlice.signature);
    let balanceAAliceBeforeSwap = instancesTokenA.alice.decrypt(tokenAAddress, encryptedBalAAlice);

    let encryptedBalBAlice = await tokenB["balanceOf(bytes32,bytes)"](tokenBAlice.publicKey, tokenBAlice.signature);
    let balanceBAliceBeforeSwap = instancesTokenB.alice.decrypt(tokenBAddress, encryptedBalBAlice);

    console.log("balance EncryptedtokenA Alice ", balanceAAlice);

    encryptedAmountA = instancesTokenA.alice.encrypt32(1000);
    encryptedAmountB = instancesTokenB.alice.encrypt32(0);
    const tx9 = await uniswapFactory.swap(
      tokenAAddress,
      tokenBAddress,
      encryptedAmountA, //4603000n,
      encryptedAmountB,
      aliceAddress,
      currentTime + 5000,
      { gasLimit: 100_000_000 },
    );
    const tx9receipt = await tx9.wait(1);
    console.log("TX9");
    console.log("Gas consumed by small swap tx : ", tx9receipt?.gasUsed);

    balLP = [];
    for (let i = 0; i < 21; i++) {
      balLP.push(await pair.totalSupply(i));
    }
    console.log(balLP);

    activeBin = await pair.activeBin();

    let activeBinIndex = await pair.activeBinIndex();
    console.log("Active Bin index : ", activeBinIndex);

    encryptedBalAAlice = await tokenA["balanceOf(bytes32,bytes)"](tokenAAlice.publicKey, tokenAAlice.signature);
    let balanceAAliceAfterSwap = instancesTokenA.alice.decrypt(tokenAAddress, encryptedBalAAlice);
    encryptedBalBAlice = await tokenB["balanceOf(bytes32,bytes)"](tokenBAlice.publicKey, tokenBAlice.signature);
    let balanceBAliceAfterSwap = instancesTokenB.alice.decrypt(tokenBAddress, encryptedBalBAlice);
    console.log("Amount Sold A: ", balanceAAliceBeforeSwap - balanceAAliceAfterSwap);
    console.log("Amount Bought B: ", balanceBAliceAfterSwap - balanceBAliceBeforeSwap);

    encryptedAmountA = instancesTokenA.alice.encrypt32(0);
    encryptedAmountB = instancesTokenB.alice.encrypt32(400000);
    const tx10 = await uniswapFactory.swap(
      tokenAAddress,
      tokenBAddress,
      encryptedAmountA,
      encryptedAmountB,
      aliceAddress,
      currentTime + 5000,
      { gasLimit: 100_000_000 },
    );
    const tx10receipt = await tx10.wait(1);
    console.log("TX10");
    console.log("Gas consumed by small swap tx : ", tx10receipt?.gasUsed);

    encryptedBalAAlice = await tokenA["balanceOf(bytes32,bytes)"](tokenAAlice.publicKey, tokenAAlice.signature);
    let balanceAAliceAfterSwap2 = instancesTokenA.alice.decrypt(tokenAAddress, encryptedBalAAlice);
    encryptedBalBAlice = await tokenB["balanceOf(bytes32,bytes)"](tokenBAlice.publicKey, tokenBAlice.signature);
    let balanceBAliceAfterSwap2 = instancesTokenB.alice.decrypt(tokenBAddress, encryptedBalBAlice);
    console.log("Amount Bought A: ", balanceAAliceAfterSwap2 - balanceAAliceAfterSwap);
    console.log("Amount Sold B: ", balanceBAliceAfterSwap - balanceBAliceAfterSwap2);

    activeBin = await pair.activeBin();

    activeBinIndex = await pair.activeBinIndex();
    console.log("Active Bin index : ", activeBinIndex);
  });
});
