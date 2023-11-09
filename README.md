# How to run tests

First build and run the custom fhevm node with a block gas limit of 100M :

```shell
docker cp fhevm:/config/setup.sh .
docker run -i -v $PWD/setup.sh:/config/setup.sh -p 8545:8545 --rm --name fhevm ghcr.io/zama-ai/evmos-dev-node:v0.1.10
```

Then use the faucet (after setting a .env, see .env.example) and run the hardhat test :

```shell
pnpm fhevm:faucet
npx hardhat test
```
