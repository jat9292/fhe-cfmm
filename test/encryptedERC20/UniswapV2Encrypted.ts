import { expect } from "chai";
import { ethers } from "hardhat";

import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { createTransaction, waitForBlock } from "../utils";

describe("Private UniswapV2", function () {
  before(async function () {
    this.signers = await getSigners(ethers);
  });

  it("Encrypted UniswapV2 Pool", async function () {
    const signers = await getSigners(ethers);
    const aliceAddress = await signers.alice.getAddress();
    const bobAddress = await signers.bob.getAddress();
    const carolAddress = await signers.carol.getAddress();
    const tokenFactory = await ethers.getContractFactory("EncryptedERC20");

    const tokenA = await tokenFactory.deploy("EncTokenA", "ETA");
    await tokenA.waitForDeployment();
    const tokenAAddress = await tokenA.getAddress();
    console.log("EncryptedERC20 TOKENA ADDRESS  :  ", tokenAAddress);
    const instancesTokenA = await createInstances(tokenAAddress, ethers, signers);

    const tokenB = await tokenFactory.deploy("EncTokenB", "ETB");
    await tokenB.waitForDeployment();
    const tokenBAddress = await tokenB.getAddress();
    console.log("EncryptedERC20 TOKENB ADDRESS  :  ", tokenBAddress);
    const instancesTokenB = await createInstances(tokenBAddress, ethers, signers);

    // ALICE mints 4294967295 tokenA and 4294967295 tokenB
    let encryptedAmount = instancesTokenA.alice.encrypt32(2147483647); // supply is type(uint32).max/2
    const tx1 = await createTransaction(tokenA.mint, encryptedAmount);
    await tx1.wait();
    encryptedAmount = instancesTokenB.alice.encrypt32(2147483647); // supply is type(uint32).max/2
    const tx2 = await createTransaction(tokenB.mint, encryptedAmount);
    await tx2.wait();

    console.log("Alice succesfully minted 2147483647 EncryptedtokenA and 2147483647 EncryptedtokenB");

    // ALICE transfers 100000 token A and 100000 token B to Bob
    let encryptedTransferAmount = instancesTokenA.alice.encrypt32(100_000);
    await createTransaction(tokenA["transfer(address,bytes)"], signers.bob.address, encryptedTransferAmount);
    encryptedTransferAmount = instancesTokenB.alice.encrypt32(100_000);
    const tx3 = await createTransaction(
      tokenB["transfer(address,bytes)"],
      signers.bob.address,
      encryptedTransferAmount,
    );
    await tx3.wait();
    const bobTokenB = tokenB.connect(signers.bob);
    let tokenBob = instancesTokenB.bob.getTokenSignature(tokenBAddress)!;
    let encryptedBalBBob = await bobTokenB["balanceOf(bytes32,bytes)"](tokenBob.publicKey, tokenBob.signature);
    let balanceBob = instancesTokenB.bob.decrypt(tokenBAddress, encryptedBalBBob);
    expect(balanceBob).to.equal(100_000);
    console.log("Alice succesfully transferred 100_000 EncryptedtokenA and 100_000 EncryptedtokenB to Bob");

    // ALICE transfers 100000 token A and 100000 token B to Carol
    encryptedTransferAmount = instancesTokenA.alice.encrypt32(100_000);
    await createTransaction(tokenA["transfer(address,bytes)"], signers.carol.address, encryptedTransferAmount);
    encryptedTransferAmount = instancesTokenB.alice.encrypt32(100_000);
    const tx4 = await createTransaction(
      tokenB["transfer(address,bytes)"],
      signers.carol.address,
      encryptedTransferAmount,
    );
    await tx4.wait();
    const carolTokenB = tokenB.connect(signers.carol);
    let tokenCarol = instancesTokenB.carol.getTokenSignature(tokenBAddress)!;
    let encryptedBalBCarol = await carolTokenB["balanceOf(bytes32,bytes)"](tokenCarol.publicKey, tokenCarol.signature);
    let balanceCarol = instancesTokenB.carol.decrypt(tokenBAddress, encryptedBalBCarol);
    expect(balanceCarol).to.equal(100_000);
    console.log("Alice succesfully transferred 100_000 EncryptedtokenA and 100_000 EncryptedtokenB to Carol");

    // ALICE deploys the Uniswap Factory
    const uniswapFactoryFactory = await ethers.getContractFactory("UniswapV2FactoryEncrypted");
    const uniswapFactory = await uniswapFactoryFactory.connect(signers.alice).deploy();
    await uniswapFactory.waitForDeployment();
    const uniswapFactoryAddress = await uniswapFactory.getAddress();
    console.log("UNISWAP FACTORY ADDRESS  :  ", uniswapFactoryAddress);

    encryptedTransferAmount = instancesTokenA.alice.encrypt32(200000000);
    await tokenA.approve(uniswapFactoryAddress, encryptedTransferAmount);
    encryptedTransferAmount = instancesTokenB.alice.encrypt32(100000000);
    await tokenB.approve(uniswapFactoryAddress, encryptedTransferAmount);

    // ALICE creates the tokenA/tokenB Uniswap pool
    const tx5 = await uniswapFactory.createPair(tokenAAddress, tokenBAddress);
    await tx5.wait();
    const pairAddress = await uniswapFactory.getPair(tokenAAddress, tokenBAddress);
    console.log("UNISWAP PAIR ADDRESS : ", pairAddress);

    // ALICE add the first amount of liquidity in the pool
    const instancesUniFactory = await createInstances(uniswapFactoryAddress, ethers, signers);
    let encryptedTransferAmountA = instancesUniFactory.alice.encrypt32(20_000_000);
    let encryptedTransferAmountB = instancesUniFactory.alice.encrypt32(10_000_000);
    let encryptedMinLiquidity = instancesUniFactory.alice.encrypt32(1500000 - 100); // we remove 100 = MINIMUM_LIQUIDITY during liquidity initialization
    const currentTime = (await ethers.provider.getBlock("latest"))?.timestamp ?? 0;

    const tx7 = await uniswapFactory.addLiquidity(
      tokenAAddress,
      tokenBAddress,
      encryptedTransferAmountA,
      encryptedTransferAmountB,
      encryptedMinLiquidity,
      aliceAddress,
      currentTime + 120,
      { gasLimit: 5000000 }, // important because here createTransaction is not enough, this is due to an issue with gas estimation when we call TFHE.decrypt :
      // see https://discord.com/channels/901152454077452399/1143742481553432617/1151169231812034672
    );
    await tx7.wait();

    console.log(
      "Alice successfully added 20_000_000 EncryptedtokenA and 10_000_000 EncryptedtokenB in the liquidity pool",
    );

    const uniswapPair = await ethers.getContractAt("UniswapV2PairEncrypted", pairAddress);

    console.log("Alice's balance of liquidity tokens : ", await uniswapPair.balanceOf(aliceAddress));

    let tokenAAlice = instancesTokenA.alice.getTokenSignature(tokenAAddress)!;
    let encryptedBalAAlice = await tokenA["balanceOf(bytes32,bytes)"](tokenAAlice.publicKey, tokenAAlice.signature);
    let balanceAAlice = instancesTokenA.alice.decrypt(tokenAAddress, encryptedBalAAlice);
    console.log("balance EncryptedtokenA Alice ", balanceAAlice);
    let tokenBAlice = instancesTokenB.alice.getTokenSignature(tokenBAddress)!;
    let encryptedBalBAlice = await tokenB["balanceOf(bytes32,bytes)"](tokenBAlice.publicKey, tokenBAlice.signature);
    let balanceBAlice = instancesTokenB.alice.decrypt(tokenBAddress, encryptedBalBAlice);
    console.log("balance EncryptedtokenB Alice ", balanceBAlice);

    // ALICE burns a small amount of liquidity
    const encryptedMinTransferAmountA = instancesUniFactory.alice.encrypt32(2000);
    const encryptedMinTransferAmountB = instancesUniFactory.alice.encrypt32(1000);
    const encryptedLiquidity = instancesUniFactory.alice.encrypt32(1500);
    const tx8 = await uniswapPair.approve(uniswapFactoryAddress, 1500);
    await tx8.wait();
    const tx9 = await uniswapFactory.removeLiquidity(
      tokenAAddress,
      tokenBAddress,
      encryptedLiquidity,
      encryptedMinTransferAmountA,
      encryptedMinTransferAmountB,
      aliceAddress,
      currentTime + 180,
      { gasLimit: 5000000 },
    );
    await tx9.wait();
    console.log(
      "Alice successfully removed 2_000 EncryptedtokenA and 1_000 EncryptedtokenB from the liquidity pool by burning 1_500 liquidity tokens",
    );

    console.log("Alice's balance of liquidity tokens : ", await uniswapPair.balanceOf(aliceAddress));

    encryptedBalAAlice = await tokenA["balanceOf(bytes32,bytes)"](tokenAAlice.publicKey, tokenAAlice.signature);
    balanceAAlice = instancesTokenA.alice.decrypt(tokenAAddress, encryptedBalAAlice);
    console.log("balance EncryptedtokenA Alice ", balanceAAlice);
    tokenBAlice = instancesTokenB.alice.getTokenSignature(tokenBAddress)!;
    encryptedBalBAlice = await tokenB["balanceOf(bytes32,bytes)"](tokenBAlice.publicKey, tokenBAlice.signature);
    balanceBAlice = instancesTokenB.alice.decrypt(tokenBAddress, encryptedBalBAlice);
    console.log("balance EncryptedtokenB Alice ", balanceBAlice);

    encryptedTransferAmount = instancesTokenA.bob.encrypt32(100_000);
    await tokenA.connect(signers.bob).approve(uniswapFactoryAddress, encryptedTransferAmount);
    encryptedTransferAmount = instancesTokenB.bob.encrypt32(100_000);
    await tokenB.connect(signers.bob).approve(uniswapFactoryAddress, encryptedTransferAmount);

    encryptedTransferAmount = instancesTokenA.carol.encrypt32(100_000);
    await tokenA.connect(signers.carol).approve(uniswapFactoryAddress, encryptedTransferAmount);
    encryptedTransferAmount = instancesTokenB.carol.encrypt32(100_000);
    const tx10 = await tokenB.connect(signers.carol).approve(uniswapFactoryAddress, encryptedTransferAmount);
    await tx10.wait();

    console.log(
      "Both Bob and Carol pre-approved both tokens for the Uniswap Factory contract, before doing any swap, to obfuscate the direction of their future trades.",
    );

    // Now Bob and Carol pre-compute their inputs to initate 2 swaps in the same block
    console.log("Now Bob and Carol pre-compute their inputs to initate 2 swaps in the same block");
    // Bob preparation : Bob wants to sell 1000 tokenB with a max slippage of 1%
    console.log("Bob preparation : Bob wants to sell 1000 tokenB with a max slippage of 1%");
    const encryptedAmountAInBob = instancesUniFactory.bob.encrypt32(0);
    const encryptedAmountBInBob = instancesUniFactory.bob.encrypt32(1000);
    const encryptedAmountAOutMinBob =
      instancesUniFactory.bob.encrypt32(
        1980,
      ); /* 1 tokenB has same marginal value as 2 tokenA, and 20=(1% of 2*1000) so Bob would accept
            a maximum slippage of 1% here (so approx 0.7% more than the 0.3% fee, to protect himself if some other transactions happen in the same block ) */
    const encryptedAmountBOutMinBob = instancesUniFactory.bob.encrypt32(0);

    // Carol preparation : Carol wants to sell 4000 tokenA with a max slippage of 1%
    console.log("Carol preparation : Carol wants to sell 4000 tokenA with a max slippage of 0.75%");
    const encryptedAmountAInCarol = instancesUniFactory.carol.encrypt32(4000);
    const encryptedAmountBInCarol = instancesUniFactory.carol.encrypt32(0);
    const encryptedAmountAOutMinCarol = instancesUniFactory.carol.encrypt32(0);
    const encryptedAmountBOutMinCarol =
      instancesUniFactory.carol.encrypt32(
        1985,
      ); /* This means a max-tolerated slippage of 0.75% because 0.5*4000*0.0075=15 */

    // Now we wait for the next new block to be mined before letting Bob and Carol submitting their swaps together in the new block
    let currentBlockNumber = await ethers.provider.getBlockNumber();
    await waitForBlock(BigInt(currentBlockNumber + 2), ethers); // to make sure to send next the following 2 swap transactions happen in a same single same block
    // Bob submits his tx:
    const tx11 = await uniswapFactory.connect(signers.bob).swapExactTokensForTokens(
      tokenAAddress,
      tokenBAddress,
      encryptedAmountAInBob,
      encryptedAmountBInBob,
      encryptedAmountAOutMinBob,
      encryptedAmountBOutMinBob,
      bobAddress,
      currentTime + 240,
      { gasLimit: 5000000 }, // important because here createTransaction is not enough, this is due to an issue with gas estimation when we call TFHE.decrypt :
      // see https://discord.com/channels/901152454077452399/1143742481553432617/1151169231812034672
    );

    // Carol submits her tx:
    const tx12 = await uniswapFactory.connect(signers.carol).swapExactTokensForTokens(
      tokenAAddress,
      tokenBAddress,
      encryptedAmountAInCarol,
      encryptedAmountBInCarol,
      encryptedAmountAOutMinCarol,
      encryptedAmountBOutMinCarol,
      carolAddress,
      currentTime + 240,
      { gasLimit: 5000000 }, // important because here createTransaction is not enough, this is due to an issue with gas estimation when we call TFHE.decrypt :
      // see https://discord.com/channels/901152454077452399/1143742481553432617/1151169231812034672
    );

    let [receipt11, receipt12] = await Promise.all([tx11.wait(), tx12.wait()]);
    console.log("Bob's swap was confirmed at block no : ", receipt11?.blockNumber);
    console.log("Carol's was confirmed at block no : ", receipt12?.blockNumber);
    expect(receipt11?.blockNumber).to.equal(receipt12?.blockNumber);
    console.log(
      " ✅ SUCESS ✅ : Bob and Alice were able to swap tokens in the same block while avoiding front-running, thanks to the fhEVM!",
    );
    tokenBob = instancesTokenA.bob.getTokenSignature(tokenAAddress)!;
    encryptedBalBBob = await tokenA
      .connect(signers.bob)
      ["balanceOf(bytes32,bytes)"](tokenBob.publicKey, tokenBob.signature);
    balanceBob = instancesTokenA.bob.decrypt(tokenAAddress, encryptedBalBBob);
    console.log("New Balance Token A Bob : ", balanceBob);
    tokenBob = instancesTokenB.bob.getTokenSignature(tokenBAddress)!;
    encryptedBalBBob = await bobTokenB["balanceOf(bytes32,bytes)"](tokenBob.publicKey, tokenBob.signature);
    balanceBob = instancesTokenB.bob.decrypt(tokenBAddress, encryptedBalBBob);
    console.log("New Balance Token B Bob : ", balanceBob);

    tokenCarol = instancesTokenA.carol.getTokenSignature(tokenAAddress)!;
    encryptedBalBCarol = await tokenA
      .connect(signers.carol)
      ["balanceOf(bytes32,bytes)"](tokenCarol.publicKey, tokenCarol.signature);
    balanceCarol = instancesTokenA.carol.decrypt(tokenAAddress, encryptedBalBCarol);
    console.log("New Balance Token A Carol : ", balanceCarol);
    tokenCarol = instancesTokenB.carol.getTokenSignature(tokenBAddress)!;
    encryptedBalBCarol = await carolTokenB["balanceOf(bytes32,bytes)"](tokenCarol.publicKey, tokenCarol.signature);
    balanceCarol = instancesTokenB.carol.decrypt(tokenBAddress, encryptedBalBCarol);
    console.log("New Balance Token B Carol : ", balanceCarol);
  });
});
