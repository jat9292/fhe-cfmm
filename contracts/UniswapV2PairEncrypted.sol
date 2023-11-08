pragma solidity 0.8.19;

import "./UniswapV2ERC20.sol";
import "./interfaces/IEncryptedERC20.sol";
import "fhevm/lib/TFHE.sol";

/*
The main problem with the current implementation is that at the end of each block, all the
transferred amounts sent in any mint, burn or swap transaction are decrypted to update the reserves of the pool (via
calls to the special _balanceOf_ function by the pair contract with the decryptor role), so confidentiality of trade amounts is
indeed lost, post-block confirmation. TODO : Another implementation would batch queues of pending transactions once in a
while **before** updating the reserves: the pool reserves would be updated only **after** the balances of all the
traders in the queue would be homomorphically updated so there would be almost no loss of confidentiality. Despite
this issue, the current implementation is already useful in order to avoid the front-running problem that is
plaguing DeFi.
*/

contract UniswapV2PairEncrypted is UniswapV2ERC20 {

    uint public constant MINIMUM_LIQUIDITY = 100; // to avoid inflation attack https://mixbytes.io/blog/overview-of-the-inflation-attack#:~:text=An%20inflation%20attack%20is%20a,significant%20losses%20for%20unsuspecting%20investors.
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));

    address public factory;
    address public router;
    address public token0; // we suppose token0 and token1 are addresses of EncryptedERC20 contracts
    address public token1;

    uint112 private reserve0;           // uses single storage slot, accessible via getReserves
    uint112 private reserve1;           // uses single storage slot, accessible via getReserves


    uint private unlocked = 1;
    modifier lock() {
        require(unlocked == 1, "UniswapV2: LOCKED");
        unlocked = 0;
        _;
        unlocked = 1;
    }

    modifier onlyRouter() {
        require(msg.sender == factory, "UniswapV2: Caller is not the router/factory");
        _;
    }

    function min(uint x, uint y) internal pure returns (uint z) {
        z = x < y ? x : y;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
    }

    event Mint(address indexed sender, address indexed to);
    event Burn(address indexed sender, address indexed to);
    event Swap(address indexed sender, address indexed to);

    constructor() {
        factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(address _token0, address _token1) external {
        require(msg.sender == factory, "UniswapV2: FORBIDDEN"); // sufficient check
        token0 = _token0;
        token1 = _token1;
    }

    // update reserves and, on the first call per block, price accumulators
    function _update(uint balance0, uint balance1) private {
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "UniswapV2: OVERFLOW");
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to) external lock onlyRouter returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1) = getReserves(); // gas savings
        uint balance0 = IEncryptedERC20(token0).balanceOfMeUnprotected(); // of course this is leaking confidentiality of the transferred amount, see comment at the top of contract for a better approach
        uint balance1 = IEncryptedERC20(token1).balanceOfMeUnprotected();

        uint amount0 = balance0-_reserve0;
        uint amount1 = balance1-_reserve1;

        uint _totalSupply = totalSupply;
        if (_totalSupply == 0) {
            require(amount0>MINIMUM_LIQUIDITY && amount1>MINIMUM_LIQUIDITY, "Initial liquidity too small");
            liquidity = (amount0/2)+(amount1/2)-MINIMUM_LIQUIDITY; // easier in FHE, instead of sqrt
            _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = min(amount0*(_totalSupply) / _reserve0, amount1*(_totalSupply) / _reserve1);
        }
        require(liquidity > 0, "UniswapV2: INSUFFICIENT_LIQUIDITY_MINTED");
        _mint(to, liquidity);

        _update(balance0, balance1);

        emit Mint(msg.sender, to);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function burn(address to) external lock onlyRouter returns (uint amount0, uint amount1)  {
        address _token0 = token0;                                // gas savings
        address _token1 = token1;                                // gas savings
        uint balance0 = IEncryptedERC20(_token0).balanceOfMeUnprotected(); // of course this is leaking confidentiality of the transferred amount, see comment at the top of contract for a better approach
        uint balance1 = IEncryptedERC20(_token1).balanceOfMeUnprotected();
        uint liquidity = balanceOf[address(this)];

        uint _totalSupply = totalSupply; 
        amount0 = liquidity*balance0 / _totalSupply; // using balances ensures pro-rata distribution
        amount1 = liquidity*balance1 / _totalSupply; // using balances ensures pro-rata distribution
        require(amount0 > 0 && amount1 > 0, "UniswapV2: INSUFFICIENT_LIQUIDITY_BURNED");
        _burn(address(this), liquidity);

        euint32 amount0Enc = TFHE.asEuint32(amount0); // using balances ensures pro-rata distribution
        euint32 amount1Enc = TFHE.asEuint32(amount1); // using balances ensures pro-rata distribution
        IEncryptedERC20(_token0).transfer(to, amount0Enc);
        IEncryptedERC20(_token1).transfer(to, amount1Enc);

        balance0 = IEncryptedERC20(_token0).balanceOfMeUnprotected(); 
        balance1 = IEncryptedERC20(_token1).balanceOfMeUnprotected(); 
                                                                      
        _update(balance0, balance1);

        emit Burn(msg.sender, to);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function swap(euint32 amount0OutEnc, euint32 amount1OutEnc, uint32 amount0Out, uint32 amount1Out, address to) external lock onlyRouter {
        require(amount0Out > 0 || amount1Out > 0, "UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT");
        (uint112 _reserve0, uint112 _reserve1) = getReserves(); // gas savings
        
        require((uint112(amount0Out) < _reserve0) && (uint112(amount1Out) < _reserve1), "UniswapV2: INSUFFICIENT_LIQUIDITY");

        uint balance0;
        uint balance1;
        { // scope for _token{0,1}, avoids stack too deep errors
        address _token0 = token0;
        address _token1 = token1;
        require(to != _token0 && to != _token1, "UniswapV2: INVALID_TO");
        IEncryptedERC20(_token0).transfer(to, amount0OutEnc); // even if amount is null, do a transfer to obfuscate trade direction
        IEncryptedERC20(_token1).transfer(to, amount1OutEnc); // even if amount is null, do a transfer to obfuscate trade direction
        balance0 = IEncryptedERC20(_token0).balanceOfMeUnprotected(); // of course this is leaking confidentiality of the transferred amount, see comment at the top of contract for a better approach
        balance1 = IEncryptedERC20(_token1).balanceOfMeUnprotected();
        }

        uint amount0In = balance0 > _reserve0 - amount0Out ? balance0 - (_reserve0 - amount0Out) : 0;
                uint amount1In = balance1 > _reserve1 - amount1Out ? balance1 - (_reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, "UniswapV2: INSUFFICIENT_INPUT_AMOUNT");
        { // scope for reserve{0,1}Adjusted, avoids stack too deep errors
        uint balance0Adjusted = balance0*1000-(amount0In*(3));
        uint balance1Adjusted = balance1*(1000)-(amount1In*(3));
        require(balance0Adjusted*(balance1Adjusted) >= uint(_reserve0)*(_reserve1)*(1000**2), "UniswapV2: K");
        }

        _update(balance0, balance1);
        emit Swap(msg.sender, to);



    }
}