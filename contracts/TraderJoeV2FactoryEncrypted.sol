pragma solidity 0.8.19;

import "./TraderJoeV2PairEncrypted.sol";
import "./interfaces/ITraderJoeV2PairEncrypted.sol";
import "./interfaces/IEncryptedERC20.sol";
import "fhevm/lib/TFHE.sol";


/*
The factory contract in this implementation also plays the role of the router. 
It is the also only contract which is able to call the low level functions mint, burn and swap from UniswapV2PairEncrypted in our case.
*/
contract TraderJoeV2FactoryEncrypted {
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

    function createPair(address to, address tokenA, address tokenB, bytes calldata amountA, bytes calldata amountB, uint32 initialLiquidity, uint8 initialActiveBin) external returns (address pair) {
        require(tokenA != tokenB, "UniswapV2: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "UniswapV2: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "UniswapV2: PAIR_EXISTS"); // single check is sufficient
        bytes memory bytecode = type(TraderJoeV2PairEncrypted).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        IEncryptedERC20(tokenA).transferFrom(msg.sender, pair, TFHE.asEuint32(amountA));
        IEncryptedERC20(tokenB).transferFrom(msg.sender, pair, TFHE.asEuint32(amountB));
        TraderJoeV2PairEncrypted(pair).initialize(to, token0, token1, initialLiquidity, initialActiveBin);
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
        bytes calldata amountAIn,
        bytes calldata amountBIn,
        uint32[] calldata liquidities,
        uint8[] calldata indexLiquidities,
        address to,
        uint deadline
    ) external ensure(deadline) {
        address pair =  getPair[tokenA][tokenB];
        require(pair != address(0), "Pool not created yet");
        
        IEncryptedERC20(tokenA).transferFrom(msg.sender, pair, TFHE.asEuint32(amountAIn));
        IEncryptedERC20(tokenB).transferFrom(msg.sender, pair, TFHE.asEuint32(amountBIn));
        ITraderJoeV2PairEncrypted(pair).mint(to, liquidities, indexLiquidities);
    }

    /// TODO : add removeLiquidity

       // **** SWAP ****
    function swap(
        address tokenA,
        address tokenB,
        bytes calldata amountAIn,
        bytes calldata amountBIn,
        address to,
        uint deadline
    ) external ensure(deadline) {
        address pair =  getPair[tokenA][tokenB];
        require(pair != address(0), "Pool not created yet");

        euint32 eamountAIn = TFHE.asEuint32(amountAIn);
        euint32 eamountBIn = TFHE.asEuint32(amountBIn);

        IEncryptedERC20(tokenA).transferFrom(msg.sender, pair, eamountAIn);
        IEncryptedERC20(tokenB).transferFrom(msg.sender, pair, eamountBIn);
        (euint32 eamount0In, euint32 eamount1In) = tokenA < tokenB ? (eamountAIn, eamountBIn) : (eamountBIn, eamountAIn);
        ITraderJoeV2PairEncrypted(pair).swap(to, eamount0In, eamount1In);
    } 

}