import { expect } from "chai";
import { ethers } from "hardhat";



describe("TraderJoeV2", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
  });

  it("TraderJoeV2 Pool sell tokenA", async function () {
    const signers = await ethers.getSigners();
    const aliceAddress = await signers[0].getAddress();
    const bobAddress = await signers[1].getAddress();
    const carolAddress = await signers[2].getAddress();
    const tokenFactory = await ethers.getContractFactory("ZNEWEncryptedERC20");

    const tokenA = await tokenFactory.deploy("EncTokenA", "ETA");
    await tokenA.waitForDeployment();
    const tokenAAddress = await tokenA.getAddress();
    console.log("EncryptedERC20 TOKENA ADDRESS  :  ", tokenAAddress);

    const tokenB = await tokenFactory.deploy("EncTokenB", "ETB");
    await tokenB.waitForDeployment();
    const tokenBAddress = await tokenB.getAddress();
    console.log("EncryptedERC20 TOKENB ADDRESS  :  ", tokenBAddress);

    let encryptedAmount = 2147483647;
    const tx1 = await tokenA.mint(encryptedAmount);
    await tx1.wait();
    const tx2 = await tokenB.mint(encryptedAmount);
    await tx2.wait();

    console.log("Alice succesfully minted 2147483647 EncryptedtokenA and 2147483647 EncryptedtokenB");

    // ALICE deploys the Uniswap Factory
    const uniswapFactoryFactory = await ethers.getContractFactory("ZNEWUniswapV2FactoryEncrypted");
    const uniswapFactory = await uniswapFactoryFactory.connect(signers[0]).deploy();
    await uniswapFactory.waitForDeployment();
    const uniswapFactoryAddress = await uniswapFactory.getAddress();
    console.log("UNISWAP FACTORY ADDRESS  :  ", uniswapFactoryAddress);

    await tokenA.approve(uniswapFactoryAddress, 1000000000);
    const tx4 = await tokenB.approve(uniswapFactoryAddress, 1000000000);
    await tx4.wait();

    // ALICE creates the tokenA/tokenB Uniswap pool
    const tx5 = await uniswapFactory.createPair(aliceAddress, tokenAAddress, tokenBAddress, 100001, 100001, 1000000, 10);
    await tx5.wait();
    const pairAddress = await uniswapFactory.getPair(tokenAAddress, tokenBAddress);
    console.log("UNISWAP PAIR ADDRESS : ", pairAddress);

    let balAPair = await tokenA.balanceOf(pairAddress);
    console.log("balAPair ", balAPair)
    let balBPair = await tokenB.balanceOf(pairAddress);
    console.log("balBPair ", balBPair)

    // ALICE add the first amount of liquidity in the pool
    const currentTime = (await ethers.provider.getBlock("latest"))?.timestamp ?? 0;

    const tx7 = await uniswapFactory.addLiquidity(
      tokenAAddress,
      tokenBAddress,
      100000000,
      100000000,
      Array(21).fill(10000000),
      [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
      aliceAddress,
      currentTime + 120,
    );
    await tx7.wait();

    balAPair = await tokenA.balanceOf(pairAddress);
    console.log("balAPair ", balAPair)
    balBPair = await tokenB.balanceOf(pairAddress);
    console.log("balBPair ", balBPair)

    let balABefore = await tokenA.balanceOfMeUnprotected();
    let balBBefore = await tokenB.balanceOfMeUnprotected();


    const pair = await ethers.getContractAt("ZNEWUniswapV2PairEncrypted", pairAddress);
    let balLP = []; 
    for (let i=0;i<21;i++){
      balLP.push(await pair.totalSupply(i)); 
    }
    console.log(balLP);

    let activeBin = await pair.activeBin();
    console.log(activeBin);

    await tokenA.approve(uniswapFactoryAddress,100000000);
    await tokenB.approve(uniswapFactoryAddress,100000000);

    const tx8 = await uniswapFactory.swap(
      tokenAAddress,
      tokenBAddress,
      4603000n,
      0,
      aliceAddress,
      currentTime + 120,
    );
    await tx8.wait(1);


    balLP = []; 
    for (let i=0;i<21;i++){
      balLP.push(await pair.totalSupply(i)); 
    }
    console.log(balLP);



    activeBin = await pair.activeBin();
    console.log(activeBin);
    let activeBinIndex = await pair.activeBinIndex();
    console.log(activeBinIndex);
    let balAAfter = await tokenA.balanceOfMeUnprotected();
    let balBAfter = await tokenB.balanceOfMeUnprotected();
    console.log("Amount Sold A: ", balABefore-balAAfter);
    console.log("Amount Bought B: ", balBAfter-balBBefore);

    balAPair = await tokenA.balanceOf(pairAddress);
    console.log("balAPair ", balAPair)
    balBPair = await tokenB.balanceOf(pairAddress);
    console.log("balBPair ", balBPair)

  });

  it("TraderJoeV2 Pool sell tokenB", async function () {
    const signers = await ethers.getSigners();
    const aliceAddress = await signers[0].getAddress();
    const bobAddress = await signers[1].getAddress();
    const carolAddress = await signers[2].getAddress();
    const tokenFactory = await ethers.getContractFactory("ZNEWEncryptedERC20");
    await tokenFactory.deploy("EncTokenMock", "ETA"); // quick hack to increase Alice's nonce so tokenA and tokenB would still get same order as before, i.e tokenA=token0 , tokenB=token1
    const tokenA = await tokenFactory.deploy("EncTokenA", "ETA");
    await tokenA.waitForDeployment();
    const tokenAAddress = await tokenA.getAddress();
    console.log("EncryptedERC20 TOKENA ADDRESS  :  ", tokenAAddress);

    const tokenB = await tokenFactory.deploy("EncTokenB", "ETB");
    await tokenB.waitForDeployment();
    const tokenBAddress = await tokenB.getAddress();
    console.log("EncryptedERC20 TOKENB ADDRESS  :  ", tokenBAddress);

    let encryptedAmount = 2147483647;
    const tx1 = await tokenA.mint(encryptedAmount);
    await tx1.wait();
    const tx2 = await tokenB.mint(encryptedAmount);
    await tx2.wait();

    console.log("Alice succesfully minted 2147483647 EncryptedtokenA and 2147483647 EncryptedtokenB");

    // ALICE deploys the Uniswap Factory
    const uniswapFactoryFactory = await ethers.getContractFactory("ZNEWUniswapV2FactoryEncrypted");
    const uniswapFactory = await uniswapFactoryFactory.connect(signers[0]).deploy();
    await uniswapFactory.waitForDeployment();
    const uniswapFactoryAddress = await uniswapFactory.getAddress();
    console.log("UNISWAP FACTORY ADDRESS  :  ", uniswapFactoryAddress);



    await tokenA.approve(uniswapFactoryAddress, 1000000000);
    const tx4 = await tokenB.approve(uniswapFactoryAddress, 1000000000);
    await tx4.wait();

    // ALICE creates the tokenA/tokenB Uniswap pool
    const tx5 = await uniswapFactory.createPair(aliceAddress, tokenAAddress, tokenBAddress, 100001, 100001, 1000000, 10);
    await tx5.wait();
    const pairAddress = await uniswapFactory.getPair(tokenAAddress, tokenBAddress);
    console.log("UNISWAP PAIR ADDRESS : ", pairAddress);
    let balAPair = await tokenA.balanceOf(pairAddress);
    console.log("balAPair ", balAPair)
    let balBPair = await tokenB.balanceOf(pairAddress);
    console.log("balBPair ", balBPair)

    // ALICE add the first amount of liquidity in the pool
    const currentTime = (await ethers.provider.getBlock("latest"))?.timestamp ?? 0;

    const tx7 = await uniswapFactory.addLiquidity(
      tokenAAddress,
      tokenBAddress,
      100000000,
      100000000,
      Array(21).fill(10000000),
      [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
      aliceAddress,
      currentTime + 120,
    );
    await tx7.wait();
    balAPair = await tokenA.balanceOf(pairAddress);
      console.log("balAPair ", balAPair)
      balBPair = await tokenB.balanceOf(pairAddress);
      console.log("balBPair ", balBPair)
    let balABefore = await tokenA.balanceOfMeUnprotected();
    let balBBefore = await tokenB.balanceOfMeUnprotected();

    const pair = await ethers.getContractAt("ZNEWUniswapV2PairEncrypted", pairAddress);
    let balLP = []; 
    for (let i=0;i<21;i++){
      balLP.push(await pair.totalSupply(i)); 
    }
    console.log(balLP);

    let activeBin = await pair.activeBin();
    console.log(activeBin);

    await tokenA.approve(uniswapFactoryAddress,100000000);
    await tokenB.approve(uniswapFactoryAddress,100000000);

    const tx8 = await uniswapFactory.swap(
      tokenAAddress,
      tokenBAddress,
      0,
      1050000n,
      aliceAddress,
      currentTime + 120,
    );
    await tx8.wait(1);


    balLP = []; 
    for (let i=0;i<21;i++){
      balLP.push(await pair.totalSupply(i)); 
    }
    console.log(balLP);



    activeBin = await pair.activeBin();
    console.log(activeBin);
    let activeBinIndex = await pair.activeBinIndex();
    console.log(activeBinIndex);

    let balAAfter = await tokenA.balanceOfMeUnprotected();
    let balBAfter = await tokenB.balanceOfMeUnprotected();
    console.log("Amount Bought A: ", balAAfter-balABefore);
    console.log("Amount Sold B: ", balBBefore-balBAfter);

    balAPair = await tokenA.balanceOf(pairAddress);
    console.log("balAPair ", balAPair)
    balBPair = await tokenB.balanceOf(pairAddress);
    console.log("balBPair ", balBPair)

  });
});

/*

 */
