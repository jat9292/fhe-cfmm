// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity 0.8.19;



interface IZNEWEncryptedERC20 { // Not really an ERC20 : missing events, missing boolean returns on transfers and approvals, not same function signatures.

    // Sets the balance of the owner to the given encrypted balance.
    function mint(uint32 encryptedAmount) external;

    // Transfers an encrypted amount from the message sender address to the `to` address.
    function transfer(address to, uint32 encryptedAmount) external;

    function balanceOfMeUnprotected() external view returns (uint32);

    // Sets the `encryptedAmount` as the allowance of `spender` over the caller's tokens.
    function approve(address spender, uint32 amount) external;

    // Transfers `encryptedAmount` tokens using the caller's allowance.
    function transferFrom(address from, address to, uint32 encryptedAmount) external;

}
