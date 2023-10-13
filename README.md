# fhe-cfmm

Private Constant Function Market Maker on the fhEVM

# Context

This work is inspired mainly by two works:

- The [Chitra et al paper](https://eprint.iacr.org/2021/1101.pdf) which showed that trade privacy cannot be achieved if
  exact spot prices are released for each trade.
- And the [Penumbra protocol](https://penumbra.zone/) which proposed a solution by using ElGamal (partial homomorphic
  encryption) to net trades in a batch before executing them.

# How to run the integration tests

First, create a `.env` file (see `.env.example`) in the root of the project and a fill the `MNEMONIC` variable
correctly. If you need to generate a new mnemonic, you can use [this site](https://iancoleman.io/bip39/).

Then install the dependencies using :

```
pnpm install
```

Then run the fhEVM with :

```
pnpm fhevm:start
```

Finally run the tests in a new terminal window with :

```
pnpm fhevm:faucet
pnpm test
```

In this test, first two EncryptedERC20, TokenA and TokenB, will be minted and distributed to Alice, Bob and Carol. Then
Alice will deploy a UniswapV2-like pool for the tokenA/tokenB and add liquidity to it. The pool will be registered as a
privilieged "Decryptor" for the two tokens by Alice (the tokens owner). Then Bob and Carol will pre-approve **both**
tokens to the Uniswap factory (which also acts as a router in our implementation) not just one of the tokens: indeed,
ideally each trader must already own a little bit of both tokens and approve both of the tokens to avoid someone
guessing the direction of the swap. During each swap, both tokens are transfered in **and** out of the pool, even if,
almost always in practise, one of the transfered _in_ amounts is null and the other transfered _out_ is also null as we
sell one of the tokens (transfer _in_ the pool) to buy the other (transferred _out_ of the pool). We do this to
obfuscate the direction of the trade.

At the end of the test, two swaps with encrypted amounts happen and are batched in a singe block, one initated by Bob
and the other by Carol.

After all the tests runned correctly stop the fhEVM with :

```
pnpm fhevm:stop
```

# Modifications done to the original ERC20Encrypted:

- added a privileged role "Decryptor" : the owner can add or remove decryptors accounts which are able to decrypt any
  encrypted balance, by calling a new version of _balanceOf_ - note: this function is now overloaded!
- added an overflow check on totalSupply Note : ERC20 is maybe not the best naming convention, as the token is not 100%
  adhering to the ERC20 standard (see comments in the `ERC20Encrypted` contract)

# Possible improvements :

- In the current implementation, we get partial differential privacy (not exctly, see next point) because the consensus
  mechanism used in fhEVM is a two steps process : for each new block, there is a first step in which a consensus is
  reached on the order of transactions, and then a second step (after the order of transactions has been decided) in
  which all the computations are done sequentially (including the threshold decryptions) to compute the new state. This
  is possible because we assume instant finality (based on Tindermint) where state is computed as a second step. This
  means that all the swaps and liquidity provisioning transactions in a single same block are batched while staying
  encrypted before the block confirmations. Decryption of the updated reserves is done only at the end of a block. But
  this is not optimal if there is very little volume in the trading pool. Instead of batching only the transactions in a
  single block, we could increase privacy by batching all the pending transactions from each "epoch". An epoch could be
  defined for instance as X blocks or each Y transactions (for eg each 10 blocks or each 10 transactions) to increase
  differential privacy. Notice however that we get worse prices in this case especially for the first ones to submit a
  pending transaction order. There is a tradeoff between privacy and efficiency. On the other hand, we can mitigate the
  worst impact on the first traders in an epoch, by using the on-chain RNG of fhEVM to do a permutation of pending
  orders. Note that the addLiquidity and removeLiquidity transactions should be added in the pending transactions set,
  not just the swaps. Furthermore it is preferable in this case to do some gas accounting : the first traders of an
  epoch should advance extra-gas (locked as ETH in the Pair contract) to refund the last one who will be responsible of
  initiating the batching of the transfers automatically.

- Anyways, batching once in a while several pending transactions is a much more sensible approach than the current
  implementation. Indeed, **the main problem** with the current implementation is that at the end of each block, all the
  transferred amounts sent in any mint, burn or swap transaction are decrypted to update the reserves of the pool (via
  calls to the special _balanceOf_ function by the pair contract with the decryptor role), so confidentiality is indeed
  lost, post-block confirmation. Another implementation (**TODO**) would batch queues of pending transactions once in a
  while **before** updating the reserves: the pool reserves would be updated only **after** the balances of all the
  traders in the queue would be homomorphically updated so there would be almost no loss of confidentiality. Despite
  this issue, the current implementation is already useful in order to avoid the front-running problem that is plaguing
  DeFi.

- We could add encryption also for the liquidity token balances and for the reserves: it is actually a prerequisite if
  we want to implement the batch-settlement idea that we discussed previously. We would still keep `reserve0` and
  `reserve1` as unencrypted state variables (useful to get the price and compute amounts to transfer), but computations
  for each trade would be based on new variables `reserve0Encrypted` and `reserve1Encrypted`. Actually, `reserve0` and
  `reserve1` would be updated only once per epoch by decrypting `reserve0Encrypted` and `reserve1Encrypted`. A big
  hurddle here is that we need to use homomorphic division with ciphertext in the denominator to make this practical, as
  they are needed for each `mint` (i.e `addLiquidity`) or `burn` (i.e `removeLiquidity`) transaction, and unfortunately
  homomorphic division with encrypted denominator is still unavailable in the fhEVM. Maybe we could start with a
  simplified model of a pool with locked liquidity i.e without possibility to add more or remove liquidity. But even in
  this case, there is still another major blocker for the fhEVM, indeed the swap function needs to evaluate expressions
  such as `uint(_reserve0)*(_reserve1)*(1000**2)` which could very easily overflow for reasonable values, as we are
  still limited to 32-bit integers size by the fhEVM. A solution could be to charge very high pool fees such as 20%, or
  to remove fees altogether but this is not economically sound...

- In the current code, despite having implemented the essential slippage protection parameters for the 3 types of
  transactions (mint, burn and swap), the user must still approximate entirely off-chain the number of tokens needed to
  be transferred in or out of the pool, doing computations based on the public reserves and taking into account the pool
  fee as well as potential slippage due to other trades happening simultaneously. He could never trade at a better price
  than expected from his computation. More precisely, as the slippage checks are done at the end of each transaction, he
  will either receive exactly the requested amounts, or nothing if the transaction reverts. We could improve on this
  situation and make the users get better and optimal prices when possible by using the _quote_ function from
  [UniswapV2Library](https://github.com/Uniswap/v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol). As
  you can notice from the simple formula, if we use the fully-confidential batch-settlement-based implementation, this
  is still not practical because homomorphic division is still missing from the fhEVM as discussed earlier.

- To reduce the variance on price of the biggest trades, we could also imagine to do like in
  [Chitra et al paper](https://eprint.iacr.org/2021/1101.pdf) : splitting (small) trades in smaller trades before
  permuting and batching the whole transactions set (for example from a batch of 10, we could divide all the amounts by
  3 and get 30 equivalent orders) . Randomness is used for both splitting up large trades and for permuting the split up
  trades, but this would cost even more gas.

- FHE let us get confidentiality of the transactions but not anonymity, i.e the traded amounts are private, but not the
  addresses of the traders. To add anonymity on top of confidentiality, we need to use ZK, for example we could imagine
  using a system like Tornado Cash with Merkle Trees and Nullifiers to get anonymity of the users (or maybe even a
  system like Stealth addresses).

- Another solution to most of the issues previously seen with the constant-product market maker would be to consider
  implementing instead a constant-sum market maker. But this is less interesting for many reasons : economically it
  would be way less useful, and technically in this case, you probably do not need a fully homomorphic scheme, a simple
  additional homormophic encryption scheme could suffice.

- Finally, a more interesting, but complex, alternative solution would be to immitate closely the Penumbra protocol:
  instead of using a constant-product market maker, we could use an aggregation of constant-sum market makers, forming a
  concentrated liquidity pool as seen here :
  [Penumbra Protocol - Concentrated Liquidity](https://protocol.penumbra.zone/main/zswap/concentrated_liquidity.html).

## License

This project is licensed under MIT.
