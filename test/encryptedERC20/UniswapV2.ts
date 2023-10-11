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

  it("Regular UniswapV2 Pool", async function () {
    const signers = await getSigners(ethers);
    const aliceAddress = await signers.alice.getAddress();
    const bobAddress = await signers.bob.getAddress();
    const tokenFactory = await ethers.getContractFactory("Token");
    const tokenA = await tokenFactory.connect(signers.alice).deploy("TokenA", "TOKA");
    await tokenA.waitForDeployment();
    const tokenAAddress = await tokenA.getAddress();
    console.log("ERC20 TOKENA ADDRESS  :  ", tokenAAddress);

    let tx = await tokenA.mint(aliceAddress, 2000000000n);
    await tx.wait();

    console.log("BALANCE ALICE A : ", await tokenA.balanceOf(aliceAddress));

    const tokenB = await tokenFactory.connect(signers.alice).deploy("TokenB", "TOKB");
    await tokenB.waitForDeployment();
    const tokenBAddress = await tokenB.getAddress();
    console.log("ERC20 TOKENB ADDRESS  :  ", tokenBAddress);

    let tx2 = await tokenB.mint(aliceAddress, 1000000000n);
    await tx2.wait();
    console.log("BALANCE ALICE B : ", await tokenB.balanceOf(aliceAddress));

    const uniswapFactoryFactory = await ethers.getContractFactory("UniswapV2Factory");
    const uniswapFactory = await uniswapFactoryFactory.connect(signers.alice).deploy();
    await uniswapFactory.waitForDeployment();
    console.log("UNISWAP FACTORY ADDRESS  :  ", await uniswapFactory.getAddress());

    let tx3 = await uniswapFactory.createPair(tokenAAddress, tokenBAddress);
    await tx3.wait();

    const pairContractAddress = await uniswapFactory.getPair(tokenAAddress, tokenBAddress);
    console.log("Pair Contract Address : ", pairContractAddress);

    const uniswapV2Router02Factory = await ethers.getContractFactory("UniswapV2Router02");
    const uniswapV2Router02 = await uniswapV2Router02Factory.deploy(await uniswapFactory.getAddress());
    await uniswapV2Router02.waitForDeployment();
    const routerAddress = await uniswapV2Router02.getAddress();

    const tx4 = await tokenA.approve(routerAddress, 20000000n);
    await tx4.wait();
    const tx5 = await tokenB.approve(routerAddress, 10000000n);
    await tx5.wait();

    const currentTime = (await ethers.provider.getBlock("latest"))?.timestamp ?? 0;

    const tx6 = await uniswapV2Router02.addLiquidity(
      tokenAAddress,
      tokenBAddress,
      20000000n,
      10000000n,
      20000000n,
      10000000n,
      aliceAddress,
      currentTime + 60,
    );
    await tx6.wait();

    const XY_before = (await tokenA.balanceOf(pairContractAddress)) * (await tokenB.balanceOf(pairContractAddress));
    console.log("XY before swap : ", XY_before);

    await tokenA.transfer(bobAddress, 100000n);
    const tx7 = await tokenA.connect(signers.bob).approve(routerAddress, 100000n);
    await tx7.wait();
    const tx8 = await uniswapV2Router02
      .connect(signers.bob)
      .swapExactTokensForTokens(100000n, 0n, [tokenAAddress, tokenBAddress], bobAddress, currentTime + 120);
    await tx8.wait();
    console.log("bob bal B : ", await tokenB.balanceOf(bobAddress));
    const XY_after = (await tokenA.balanceOf(pairContractAddress)) * (await tokenB.balanceOf(pairContractAddress));
    console.log("XY before swap : ", XY_after);

    const tx9 = await tokenB.connect(signers.bob).approve(routerAddress, 100000000n);
    await tx9.wait();
    const tx10 = await uniswapV2Router02
      .connect(signers.bob)
      .swapTokensForExactTokens(1000n, 10000000000000n, [tokenBAddress, tokenAAddress], bobAddress, currentTime + 180);
    await tx10.wait();

    console.log("bob bal B after second swap : ", await tokenB.balanceOf(bobAddress));
    console.log("bob bal A after second swap : ", await tokenA.balanceOf(bobAddress));
    const XY_after2 = (await tokenA.balanceOf(pairContractAddress)) * (await tokenB.balanceOf(pairContractAddress));
    console.log("XY after second swap : ", XY_after2);
  });
});
