pragma solidity 0.8.19;

import "./ZNEWUniswapV2PairEncrypted.sol";
import "./interfaces/IZNEWUniswapV2PairEncrypted.sol";
import "./interfaces/IZNEWEncryptedERC20.sol";


/*
The factory contract in this implementation also plays the role of the router. 
It is the also only contract which is able to call the low level functions mint, burn and swap from UniswapV2PairEncrypted in our case.
*/
contract ZNEWUniswapV2FactoryEncrypted {
    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, "UniswapV2Router: EXPIRED");
        _;
    }

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(address to, address tokenA, address tokenB, uint32 amountA, uint32 amountB, uint32 initialLiquidity, uint8 initialActiveBin) external returns (address pair) {
        require(tokenA != tokenB, "UniswapV2: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "UniswapV2: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "UniswapV2: PAIR_EXISTS"); // single check is sufficient
        bytes memory bytecode = type(ZNEWUniswapV2PairEncrypted).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IZNEWEncryptedERC20(tokenA).transferFrom(msg.sender, pair, amountA);
        IZNEWEncryptedERC20(tokenB).transferFrom(msg.sender, pair, amountB);
        ZNEWUniswapV2PairEncrypted(pair).initialize(to, token0, token1, initialLiquidity, initialActiveBin);
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length);
    }

        // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "ZERO_ADDRESS");
    }

    // **** ADD LIQUIDITY ****
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint32 amountAIn,
        uint32 amountBIn,
        uint32[] calldata liquidities,
        uint8[] calldata indexLiquidities,
        address to,
        uint deadline
    ) external ensure(deadline) {
        address pair =  getPair[tokenA][tokenB];
        require(pair != address(0), "Pool not created yet");
        
        IZNEWEncryptedERC20(tokenA).transferFrom(msg.sender, pair, amountAIn);
        IZNEWEncryptedERC20(tokenB).transferFrom(msg.sender, pair, amountBIn);
        IZNEWUniswapV2PairEncrypted(pair).mint(to, liquidities, indexLiquidities);
    }

    /// TODO : add removeLiquidity

        // **** SWAP ****
    function swap(
        address tokenA,
        address tokenB,
        uint32 amountAIn,
        uint32 amountBIn,
        address to,
        uint deadline
    ) external ensure(deadline) {
        address pair =  getPair[tokenA][tokenB];
        require(pair != address(0), "Pool not created yet");
        
        IZNEWEncryptedERC20(tokenA).transferFrom(msg.sender, pair, amountAIn);
        IZNEWEncryptedERC20(tokenB).transferFrom(msg.sender, pair, amountBIn);
        (uint32 amount0In, uint32 amount1In) = tokenA < tokenB ? (amountAIn, amountBIn) : (amountBIn, amountAIn);
        IZNEWUniswapV2PairEncrypted(pair).swap(to, amount0In, amount1In);
    }

}