pragma solidity 0.8.19;

import "./UniswapV2PairEncrypted.sol";
import "./interfaces/IUniswapV2PairEncrypted.sol";
import "./interfaces/IEncryptedERC20.sol";
import "fhevm/lib/TFHE.sol";

/*
The factory contract in this implementation also plays the role of the router. 
It is the also only contract which is able to call the low level functions mint, burn and swap from UniswapV2PairEncrypted in our case.
*/
contract UniswapV2FactoryEncrypted {
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

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, "UniswapV2: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "UniswapV2: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "UniswapV2: PAIR_EXISTS"); // single check is sufficient
        bytes memory bytecode = type(UniswapV2PairEncrypted).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        UniswapV2PairEncrypted(pair).initialize(token0, token1);
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
        bytes calldata encryptedAmountA,
        bytes calldata encryptedAmountB,
        uint256 minLiquidity, // for slippage protection
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint liquidity) {
        address pair =  getPair[tokenA][tokenB];
        require(pair != address(0), "Pool not created yet");
        require(IEncryptedERC20(tokenA).decryptors(pair) && IEncryptedERC20(tokenB).decryptors(pair) , "Pool must be registered as decryptors for both tokens");
        
        IEncryptedERC20(tokenA).transferFrom(msg.sender, pair, TFHE.asEuint32(encryptedAmountA));
        IEncryptedERC20(tokenB).transferFrom(msg.sender, pair, TFHE.asEuint32(encryptedAmountB));
        liquidity = IUniswapV2PairEncrypted(pair).mint(to);
        require(liquidity>=minLiquidity,"Insufficient tokens sent");
    }

    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        bytes calldata encryptedAmountMinA,  // for slippage protection
        bytes calldata encryptedAmountMinB,  // for slippage protection
        address to,
        uint deadline
    ) public ensure(deadline) returns (uint amountA, uint amountB) {
        address pair =  getPair[tokenA][tokenB];
        IUniswapV2PairEncrypted(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amount0, uint amount1) = IUniswapV2PairEncrypted(pair).burn(to);
        (address token0,) = sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        ebool amountA_OK = TFHE.le(TFHE.asEuint32(encryptedAmountMinA), TFHE.asEuint32(amountA));
        require(TFHE.decrypt(amountA_OK),"UniswapV2Router: INSUFFICIENT_A_AMOUNT");
        ebool amountB_OK = TFHE.le(TFHE.asEuint32(encryptedAmountMinB), TFHE.asEuint32(amountB));
        require(TFHE.decrypt(amountB_OK), "UniswapV2Router: INSUFFICIENT_B_AMOUNT");
    }


    // **** SWAP **** // typically either (AmountAIn and AmountBOutMin) are both null or (AmountBIn and AmountAOutMin) are both null
    function swapExactTokensForTokens(
        address tokenA,
        address tokenB,
        bytes calldata encryptedAmountAIn,
        bytes calldata encryptedAmountBIn,
        bytes calldata encryptedAmountAOutMin, // slippage protection
        bytes calldata encryptedAmountBOutMin, // slippage protection
        address to,
        uint deadline
    ) external ensure(deadline) {
        address pairAddress = getPair[tokenA][tokenB];
        {

        euint32 encryptedAmountAInEUINT32 = TFHE.asEuint32(encryptedAmountAIn); // even if amount is null, do a transfer to obfuscate trade direction
        euint32 encryptedAmountBInEUINT32 = TFHE.asEuint32(encryptedAmountBIn); // even if amount is null, do a transfer to obfuscate trade direction
        IEncryptedERC20(tokenA).transferFrom(
            msg.sender, pairAddress, encryptedAmountAInEUINT32
        );
        IEncryptedERC20(tokenB).transferFrom(
            msg.sender, pairAddress, encryptedAmountBInEUINT32
        );
        }
        euint32 encryptedAmountAOutMinEUINT32 = TFHE.asEuint32(encryptedAmountAOutMin);
        euint32 encryptedAmountBOutMinEUINT32 = TFHE.asEuint32(encryptedAmountBOutMin);
        (euint32 amount0OutEnc, euint32 amount1OutEnc) = tokenA < tokenB ? (encryptedAmountAOutMinEUINT32, encryptedAmountBOutMinEUINT32) : (encryptedAmountBOutMinEUINT32, encryptedAmountAOutMinEUINT32);
        uint32 amount0Out = TFHE.decrypt(amount0OutEnc);
        uint32 amount1Out = TFHE.decrypt(amount1OutEnc);
        IUniswapV2PairEncrypted(pairAddress).swap(
            amount0OutEnc, amount1OutEnc, amount0Out, amount1Out, to
        );
    }

}