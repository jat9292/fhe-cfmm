pragma solidity 0.8.19;
import "fhevm/lib/TFHE.sol";


interface IZNEWUniswapV2PairEncrypted {


    // called once by the factory at time of deployment
    function initialize(address to, address _token0, address _token1, uint32 initialLiquidity, uint8 initialActiveBin) external;


    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to, uint32[] calldata liquidities,  uint8[] calldata indexLiquidities) external;

    function swap(address to, euint32 amount0, euint32 amount1 ) external;
}