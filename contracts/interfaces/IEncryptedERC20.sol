// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity 0.8.19;

import "fhevm/lib/TFHE.sol";

interface IEncryptedERC20 { // Not really an ERC20 : missing events, missing boolean returns on transfers and approvals, not same function signatures.

    // Sets the balance of the owner to the given encrypted balance.
    function mint(bytes calldata encryptedAmount) external;

    // Transfers an encrypted amount from the message sender address to the `to` address.
    function transfer(address to, bytes calldata encryptedAmount) external;

    // Transfers an amount from the message sender address to the `to` address.
    function transfer(address to, euint32 amount) external;

    function getTotalSupply(
        bytes32 publicKey,
        bytes calldata signature
    ) external view returns (bytes memory);

    // Returns the balance of the caller encrypted under the provided public key.
    function balanceOf(
        bytes32 publicKey,
        bytes calldata signature
    ) external view returns (bytes memory);

    function balanceOfMeUnprotected() external view returns (uint32);

    // Sets the `encryptedAmount` as the allowance of `spender` over the caller's tokens.
    function approve(address spender, bytes calldata encryptedAmount) external;

    // Returns the remaining number of tokens that `spender` is allowed to spend
    // on behalf of the caller. The returned ciphertext is under the caller public FHE key.
    function allowance(
        address spender,
        bytes32 publicKey,
        bytes calldata signature
    ) external view returns (bytes memory);

    // Transfers `encryptedAmount` tokens using the caller's allowance.
    function transferFrom(address from, address to, bytes calldata encryptedAmount) external;

    // Transfers `amount` tokens using the caller's allowance.
    function transferFrom(address from, address to, euint32 amount) external;

}
