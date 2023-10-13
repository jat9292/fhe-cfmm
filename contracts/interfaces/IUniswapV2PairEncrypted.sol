pragma solidity 0.8.19;

import "fhevm/lib/TFHE.sol";

interface IUniswapV2PairEncrypted {
    function mint(address to) external returns (uint);

    function transferFrom(address from, address to, uint value) external returns (bool);

    function burn(address to) external returns (uint, uint);

    function swap(euint32 amount0OutEnc, euint32 amount1OutEnc, uint32 amount0Out, uint32 amount1Out, address to) external;
}