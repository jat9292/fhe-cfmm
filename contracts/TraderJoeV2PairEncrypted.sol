pragma solidity 0.8.19;


import "./interfaces/IEncryptedERC20.sol";
import "fhevm/lib/TFHE.sol";

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

contract TraderJoeV2PairEncrypted is LBToken {

    uint32 public constant MINIMUM_LIQUIDITY = 10000; // to avoid inflation attack https://mixbytes.io/blog/overview-of-the-inflation-attack#:~:text=An%20inflation%20attack%20is%20a,significant%20losses%20for%20unsuspecting%20investors.
    bool initialized = false; // swaps should not start before the first deposit of liquidity, also helps to avoid the inflation attack by front-running first deposit
    address public factory;
    address public token0; // we suppose token0 and token1 are addresses of EncryptedERC20 contracts
    address public token1;

    euint32 private reserve0;           // uses single storage slot, accessible via getReserves
    euint32 private reserve1;           // uses single storage slot, accessible via getReserves
    uint8 public activeBinIndex;
    bool _firstMint = true;

    struct ActiveBin {
        euint32 amount0;
        euint32 amount1;
    }

    ActiveBin private activeBin;


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

    function getReserves() public view returns (euint32 _reserve0, euint32 _reserve1) {
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
    function _update(euint32 balance0, euint32 balance1) private {
        reserve0 = balance0;
        reserve1 = balance1;
    }

    function binToPrice(uint8 binIndex) internal pure returns(uint32) { 
        return uint32( ( (1e2*(5**binIndex))/(4**binIndex)) / 9 - 3); // 1e2 because precision of 2 digits, -3 to get exact parity at binIndex=10, and 9 = (5**10)//(4**10) , i.e approx +/-25% per bin jump. 100 = price of 1 for token0 quoted in token1. // 1 = price of 0.01 for token 0
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to, uint32[] memory liquidities, uint8[] memory indexLiquidities ) public lock onlyRouter {
        require(indexLiquidities.length==liquidities.length, "Length mismatch between the indexLiquidities and the liquidities arrays");
        (euint32 _reserve0, euint32 _reserve1) = getReserves();
        euint32 amount0;
        euint32 amount1;
        {
        euint32 balance0 = IEncryptedERC20(token0).balanceOfMeUnprotected();
        euint32 balance1 = IEncryptedERC20(token1).balanceOfMeUnprotected();

        amount0 = balance0-_reserve0;
        amount1 = balance1-_reserve1;
        }

        for (uint8 indexLiq=0; indexLiq<indexLiquidities.length; indexLiq++){
            uint8 index = indexLiquidities[indexLiq];
            require(index<21,"Index must be between 0 and 20 incusive - index 10 is parity price"); // binPrice(10)=100 , i.e Price(Token0) = Price(Token1)

            if (index<activeBinIndex){
                require(TFHE.decrypt(TFHE.gt(amount1,liquidities[indexLiq]/1e2)), "Not enough token1 sent");
                amount1 = amount1 - TFHE.asEuint32(liquidities[indexLiq]/1e2 + 1); // precision of 2 digits : BinToPrice*Tok0 + 100*Tok1 = Liquidity  (in each bin)
                _mint(to,index,  liquidities[indexLiq]);  
            }

            if (index>activeBinIndex){
                require(TFHE.decrypt(TFHE.gt(amount0,liquidities[indexLiq]/binToPrice(index))), "Not enough token0 sent");
                amount0 = amount0 - TFHE.asEuint32(liquidities[indexLiq]/binToPrice(index) + 1);
                _mint(to,index, liquidities[indexLiq]); 
            } 

            if  (index==activeBinIndex)
            {
                require(initialized || liquidities[indexLiq]>=MINIMUM_LIQUIDITY, "Not enough liquidity provided");

                euint32 amount0Used = TFHE.asEuint32((liquidities[indexLiq]/2)/binToPrice(index) + 1);  // put equivalent quantities of both tokens in the active bin
                euint32 amount1Used =  TFHE.asEuint32((liquidities[indexLiq]/2)/1e2 + 1);
                amount0 = amount0 - amount0Used;
                amount1 = amount1 - amount1Used;
                if(initialized){
                    _mint(to,index, liquidities[indexLiq]);
                } else {
                    _mint(to,index, liquidities[indexLiq]-MINIMUM_LIQUIDITY);
                    _mint(address(0),index, MINIMUM_LIQUIDITY);
                    initialized = true; // for initialization
                }
                activeBin.amount0 = activeBin.amount0 + amount0Used;
                activeBin.amount1 = activeBin.amount1 + amount1Used;
            }
        }

        // reimburse excess
        IEncryptedERC20(token0).transfer(to,amount0);
        IEncryptedERC20(token1).transfer(to,amount1);
        {
        euint32 balance0 = IEncryptedERC20(token0).balanceOfMeUnprotected();
        euint32 balance1 = IEncryptedERC20(token1).balanceOfMeUnprotected();
        _update(balance0, balance1);
        }

        emit Mint(msg.sender, to);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function swap(address to, euint32 amount0, euint32 amount1 ) external lock onlyRouter {
        ebool amount0IsZero = TFHE.eq(amount0,0);
        ebool amount1IsZero = TFHE.eq(amount1,0);
        //// require(TFHE.decrypt(TFHE.xor(amount0IsZero,amount1IsZero)), "Exactly one of the inputed amounts must be null"); // FHEVM bug? TFHE.xor and TFHE.not are not working
        bool amount0IsZeroBool = TFHE.decrypt(amount0IsZero);
        bool amount1IsZeroBool =  TFHE.decrypt(amount1IsZero);
        require((amount0IsZeroBool&&!amount1IsZeroBool) || (!amount0IsZeroBool&&amount1IsZeroBool), "Exactly one of the inputed amounts must be null");
        euint32 zeroEncrypted = TFHE.asEuint32(0);
        uint32 maxUint32 = 4294967295;

        if (TFHE.decrypt(amount1IsZero)){  // sell token 0 For Token1 , TODO : replace with CMUX and do a null transfer for the other token
            euint32 accumulatedDelta1 = zeroEncrypted;
            
            for(uint i=0; i<20; i++) { // max 20 bin jumps with our configuration , or some lower limit if you want to avoid hughe slippage
                
                euint32 multiplication = TFHE.mul(amount0,binToPrice(activeBinIndex));
                if (i==0){ // we need to check the overflow only in the first step, because both amount0 and binToPrice are maximal in the start of the swap
                    // We could also have avoided this overflow check if we added a check on a wisely chosen max value for amount0
                    require(TFHE.decrypt(TFHE.lt(multiplication,maxUint32/binToPrice(activeBinIndex))),"Multiplication overflow"); // Overflow check
                }
                
                euint32 delta1 = TFHE.div(multiplication,100);
                
                if (TFHE.decrypt(TFHE.le(delta1,activeBin.amount1))){ // stay in last bin
                    accumulatedDelta1=accumulatedDelta1+delta1;
                    activeBin.amount1=activeBin.amount1-delta1;
                    activeBin.amount0=activeBin.amount0+amount0;
                    
                    IEncryptedERC20(token1).transfer(to,accumulatedDelta1);
                    break;
                }
                else { // shift to next bin, in trader joe v2 this is done efficiently for a big number of bins using a tree traversal
                    euint32 delta0 = TFHE.asEuint32(totalSupply(activeBinIndex)/binToPrice(activeBinIndex))-activeBin.amount0;
                    accumulatedDelta1=accumulatedDelta1+TFHE.div(TFHE.mul(delta0,binToPrice(activeBinIndex)),100);
                    amount0= amount0-delta0;
                    require(activeBinIndex>=0, "Swap rejected, insufficient liquidity");
                    activeBinIndex -= 1;
                    activeBin.amount1=TFHE.asEuint32(totalSupply(activeBinIndex)/100);
                    activeBin.amount0=zeroEncrypted;
                }
            }
        } else { // case we exchange token1 for token0
            euint32 accumulatedDelta0 = zeroEncrypted;
            for(uint i=0; i<20; i++) { 
                euint32 multiplication = TFHE.mul(amount1,100);
                if (i==0){ // we need to check the overflow only in the first step, because amount1 is maximal in the start of the swap
                    // We could also have avoided this overflow check if we added a check on a wisely chosen max value for amount1
                    require(TFHE.decrypt(TFHE.lt(multiplication,maxUint32/100)),"Multiplication overflow"); // Overflow check
                }

                euint32 delta0 = TFHE.div(multiplication,binToPrice(activeBinIndex)); 

                if (TFHE.decrypt(TFHE.le(delta0,activeBin.amount0))){ // stay in last bin 
                    accumulatedDelta0=accumulatedDelta0+delta0;
                    activeBin.amount0=activeBin.amount0-delta0;
                    activeBin.amount1=activeBin.amount1+amount1;
                    IEncryptedERC20(token0).transfer(to,accumulatedDelta0);
                    break;
                }
                else { // shift to next bin, in trader joe v2 this is done efficiently for a big number of bins using a tree traversal
                    euint32 delta1 = (TFHE.asEuint32(totalSupply(activeBinIndex)/100)-activeBin.amount1); 
                    accumulatedDelta0=accumulatedDelta0+TFHE.div(TFHE.mul(delta1,100),binToPrice(activeBinIndex));
                    amount1= amount1-delta1;
                    activeBinIndex += 1;
                    require(activeBinIndex<21, "Swap rejected, insufficient liquidity");
                    activeBin.amount0=TFHE.asEuint32(totalSupply(activeBinIndex)/binToPrice(activeBinIndex));
                    activeBin.amount1=zeroEncrypted;
                }
            }
        }

        euint32 balance0 = IEncryptedERC20(token0).balanceOfMeUnprotected();
        euint32 balance1 = IEncryptedERC20(token1).balanceOfMeUnprotected();
        _update(balance0, balance1);
        emit Swap(msg.sender, to);
    }
}