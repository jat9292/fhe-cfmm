// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity 0.8.19;





contract ZNEWEncryptedERC20  { // Not really an ERC20 : missing events, missing boolean returns on transfers and approvals, not same function signatures.
    uint32 private totalSupply; // EUINT32
    string public name; // City of Zama's battle
    string public symbol;

    // used for output authorization
    bytes32 private DOMAIN_SEPARATOR;

    // A mapping from address to an encrypted balance.
    mapping(address => uint32) internal balances; // EUINT32

    // A mapping of the form mapping(owner => mapping(spender => allowance)).
    mapping(address => mapping(address => uint32)) internal allowances; // EUINT32

    // The owner of the contract.
    address public contractOwner;

    constructor(string memory _name, string memory _symbol) {
        contractOwner = msg.sender;
        name = _name;
        symbol = _symbol;
    }

    // Sets the balance of the owner to the given encrypted balance.
    function mint(uint32 amount) public onlyContractOwner { // BYTES EUINT32
        //euint32 amount = TFHE.asEuint32(encryptedAmount); // EUINT32
        balances[contractOwner] = balances[contractOwner] + amount;
        //euint32 totalSupply_ = totalSupply; // UINT32
        totalSupply = totalSupply + amount;
        // require(TFHE.decrypt(TFHE.le(totalSupply_, totalSupply))); // added this check to avoid supply overflow // TFHE UINT32
    }

    // Transfers an encrypted amount from the message sender address to the `to` address.
    function transfer(address to, uint32 amount) public {
        _transfer(msg.sender, to, amount);
    }

    // Transfers an amount from the message sender address to the `to` address.
    /* function transfer(address to, euint32 amount) public { // EUINT32
        _transfer(msg.sender, to, amount);
    } */

    /*function getTotalSupply(
        bytes32 publicKey,
        bytes calldata signature
    ) public view onlySignedPublicKey(publicKey, signature) returns (bytes memory) {
        return TFHE.reencrypt(totalSupply, publicKey, 0);
    } */

    // Returns the balance of the caller encrypted under the provided public key.
    /*function balanceOf(
        bytes32 publicKey,
        bytes calldata signature
    ) public view onlySignedPublicKey(publicKey, signature) returns (bytes memory) {
        return TFHE.reencrypt(balances[msg.sender], publicKey, 0);
    } */

    function balanceOf(address add) public view returns (uint32) {
        // return TFHE.decrypt(balances[msg.sender]); // EUINT32
        return balances[add];
    }

    // WARNING: do NOT use unless you accept to loose confidentiality of your balance (useful for AMMs)
    function balanceOfMeUnprotected() public view returns (uint32) {
        // return TFHE.decrypt(balances[msg.sender]); // EUINT32
        return balances[msg.sender];
    }

    // Sets the `encryptedAmount` as the allowance of `spender` over the caller's tokens.
    function approve(address spender, uint32 encryptedAmount) public {
        address owner = msg.sender;
        //_approve(owner, spender, TFHE.asEuint32(encryptedAmount));
        _approve(owner, spender, encryptedAmount);
    }

    // Returns the remaining number of tokens that `spender` is allowed to spend
    // on behalf of the caller. The returned ciphertext is under the caller public FHE key.
    /*function allowance(
        address spender,
        bytes32 publicKey,
        bytes calldata signature
    ) public view onlySignedPublicKey(publicKey, signature) returns (bytes memory) {
        address owner = msg.sender;

        return TFHE.reencrypt(_allowance(owner, spender), publicKey);
    } */

    function transferFrom(address from, address to, uint32 amount) public {
        address spender = msg.sender;
        _updateAllowance(from, spender, amount);
        _transfer(from, to, amount);
    }




    function _approve(address owner, address spender, uint32 amount) internal {
        allowances[owner][spender] = amount;
    }

    function _allowance(address owner, address spender) internal view returns (uint32) {
        /*if (TFHE.isInitialized(allowances[owner][spender])) {
            return allowances[owner][spender];
        } else {
            return TFHE.asEuint32(0);
        }*/
        return allowances[owner][spender];
    }

    function _updateAllowance(address owner, address spender, uint32 amount) internal {
        uint32 currentAllowance = _allowance(owner, spender);
        //require(TFHE.decrypt(TFHE.le(amount, currentAllowance)));
        _approve(owner, spender, currentAllowance - amount);
    }

    // Transfers an encrypted amount.
    function _transfer(address from, address to, uint32 amount) internal {
        // Make sure the sender has enough tokens.
        //require(TFHE.decrypt(TFHE.le(amount, balances[from])));

        // Add to the balance of `to` and subract from the balance of `from`.
        balances[to] = balances[to] + amount;
        balances[from] = balances[from] - amount;
    }
    
    modifier onlyContractOwner() {
        require(msg.sender == contractOwner);
        _;
    }
}
