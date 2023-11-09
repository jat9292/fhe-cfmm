pragma solidity 0.8.19;


import "./interfaces/IZNEWEncryptedERC20.sol";

import "./LBToken.sol";

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

contract ZNEWUniswapV2PairEncrypted is LBToken {

    uint32 public constant MINIMUM_LIQUIDITY = 10000; // to avoid inflation attack https://mixbytes.io/blog/overview-of-the-inflation-attack#:~:text=An%20inflation%20attack%20is%20a,significant%20losses%20for%20unsuspecting%20investors.
    bool initialized = false; // swaps should not start before the first deposit of liquidity, also helps to avoid the inflation attack by front-running first deposit
    address public factory;
    address public token0; // we suppose token0 and token1 are addresses of EncryptedERC20 contracts
    address public token1;

    uint32 private reserve0;           // uses single storage slot, accessible via getReserves
    uint32 private reserve1;           // uses single storage slot, accessible via getReserves
    uint8 public activeBinIndex;
    bool _firstMint = true;

    struct ActiveBin {
        uint32 amount0;
        uint32 amount1;
    }

    ActiveBin public activeBin;


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

    function getReserves() public view returns (uint32 _reserve0, uint32 _reserve1) {
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
    function initialize(address to, address _token0, address _token1, uint32 initialLiquidity, uint8 initialActiveBin) external {
        require(msg.sender == factory, "UniswapV2: FORBIDDEN"); // sufficient check
        token0 = _token0;
        token1 = _token1;
        activeBinIndex = initialActiveBin;
        uint32[] memory liquidities = new uint32[](1);
        liquidities[0] = initialLiquidity;
        uint8[] memory indexLiquidities = new uint8[](1);
        indexLiquidities[0] = initialActiveBin;
        mint(to, liquidities, indexLiquidities);
    }

    // update reserves and, on the first call per block, price accumulators
    function _update(uint32 balance0, uint32 balance1) private {
        reserve0 = balance0;
        reserve1 = balance1;
    }

    function binToPrice(uint8 binIndex) internal pure returns(uint32) { 
        return uint32( ( (1e2*(5**binIndex))/(4**binIndex)) / 9 - 3); // 1e2 because precision of 2 digits, -3 to get exact parity at binIndex=10, and 9 = (5**10)//(4**10) , i.e approx +/-25% per bin jump. 100 = price of 1 for token0 quoted in token1. // 1 = price of 0.01 for token 0
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to, uint32[] memory liquidities, uint8[] memory indexLiquidities ) public lock onlyRouter {
        require(indexLiquidities.length==liquidities.length, "Length mismatch between the indexLiquidities and the liquidities arrays");
        (uint32 _reserve0, uint32 _reserve1) = getReserves();
        uint32 amount0;
        uint32 amount1;
        {
        uint32 balance0 = IZNEWEncryptedERC20(token0).balanceOfMeUnprotected();
        uint32 balance1 = IZNEWEncryptedERC20(token1).balanceOfMeUnprotected();

        amount0 = balance0-_reserve0;
        amount1 = balance1-_reserve1;
        }

        for (uint8 indexLiq=0; indexLiq<indexLiquidities.length; indexLiq++){
            uint8 index = indexLiquidities[indexLiq];
            require(index<21,"Index must be between 0 and 20 incusive - index 10 is parity price"); // binPrice(10)=100 , i.e Price(Token0) = Price(Token1)

            if (index<activeBinIndex){
                require(amount1>=liquidities[indexLiq]/1e2 + 1, "Not enough token1 sent");
                amount1 -=liquidities[indexLiq]/1e2 + 1; // precision of 2 digits : BinToPrice*Tok0 + 100*Tok1 = Liquidity  (in each bin)
                _mint(to,index,  liquidities[indexLiq]);  
            }

            if (index>activeBinIndex){
                require(amount0>=liquidities[indexLiq]/binToPrice(index) + 1, "Not enough token0 sent");
                amount0 -=liquidities[indexLiq]/binToPrice(index) + 1;
                _mint(to,index, liquidities[indexLiq]); 
            } 

            if  (index==activeBinIndex)
            {
                require(initialized || liquidities[indexLiq]>=MINIMUM_LIQUIDITY, "Not enough liquidity provided");

                uint32 amount0Used = (liquidities[indexLiq]/2)/binToPrice(index) + 1;  // put equivalent quantities of both tokens in the active bin
                uint32 amount1Used = (liquidities[indexLiq]/2)/1e2 + 1;
                amount0 -= amount0Used;
                amount1 -= amount1Used;
                if(initialized){
                    _mint(to,index, liquidities[indexLiq]);
                } else {
                    _mint(to,index, liquidities[indexLiq]-MINIMUM_LIQUIDITY);
                    _mint(address(0),index, MINIMUM_LIQUIDITY);
                    initialized = true; // for initialization
                }
                activeBin.amount0 += amount0Used;
                activeBin.amount1 += amount1Used;
            }
        }

        // reimburse excess
        IZNEWEncryptedERC20(token0).transfer(to,amount0);
        IZNEWEncryptedERC20(token1).transfer(to,amount1);
        {
        uint32 balance0 = IZNEWEncryptedERC20(token0).balanceOfMeUnprotected();
        uint32 balance1 = IZNEWEncryptedERC20(token1).balanceOfMeUnprotected();
        _update(balance0, balance1);
        }

        emit Mint(msg.sender, to);
    }

        // this low-level function should be called from a contract which performs important safety checks
    function swap(address to, uint32 amount0, uint32 amount1 ) external lock onlyRouter {
        require((amount0==0 && amount1!=0) || (amount0!=0 && amount1==0), "Exactly one of the inputed amounts must be null");
        bool tok0ForTok1 = (amount0!=0);
        uint32 accumulatedDelta0 = 0;
        uint32 accumulatedDelta1 = 0;

        if (tok0ForTok1){  // replace with CMUX in encrypted version
            while (true) {
                uint32 delta1 = binToPrice(activeBinIndex)*amount0/100; // check for overflow in encrypted version
                if (delta1<=activeBin.amount1){ // stay in last bin
                    accumulatedDelta1+=delta1;
                    activeBin.amount1-=delta1;
                    activeBin.amount0+=amount0;
                    amount0 = 0;
                    IZNEWEncryptedERC20(token1).transfer(to,accumulatedDelta1);
                    break;
                }
                else { // shift to next bin, in trader joe v2 this is done efficiently for a big number of bins using a tree traversal
                    uint32 delta0 = (totalSupply(activeBinIndex)/binToPrice(activeBinIndex)-activeBin.amount0);
                    accumulatedDelta1+=delta0*binToPrice(activeBinIndex)/100;
                    amount0-= delta0;
                    require(activeBinIndex>=0, "Swap rejected, insufficient liquidity");
                    activeBinIndex -= 1;
                    activeBin.amount1=totalSupply(activeBinIndex)/100;
                    activeBin.amount0=0;
                }
            }
        } else { // case we exchange token1 for token0
            while (true) {
                uint32 delta0 = 100*amount1/binToPrice(activeBinIndex); // check for overflow in encrypted version
                if (delta0<=activeBin.amount0){ // stay in last bin
                    accumulatedDelta0+=delta0;
                    activeBin.amount0-=delta0;
                    activeBin.amount1+=amount1;
                    amount1 = 0;
                    IZNEWEncryptedERC20(token0).transfer(to,accumulatedDelta0);
                    break;
                }
                else { // shift to next bin, in trader joe v2 this is done efficiently for a big number of bins using a tree traversal
                    uint32 delta1 = (totalSupply(activeBinIndex)/100-activeBin.amount1);
                    accumulatedDelta0+=delta1*100/binToPrice(activeBinIndex);
                    amount1-= delta1;


                    activeBinIndex += 1;
                    require(activeBinIndex<21, "Swap rejected, insufficient liquidity");
                    activeBin.amount0=totalSupply(activeBinIndex)/binToPrice(activeBinIndex);
                    activeBin.amount1=0;
                }
            }
        }

        emit Swap(msg.sender, to);
    }
}