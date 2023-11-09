// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

interface ILBToken {
    error LBToken__AddressThisOrZero();
    error LBToken__InvalidLength();
    error LBToken__SelfApproval(address owner);
    error LBToken__SpenderNotApproved(address from, address spender);
    error LBToken__TransferExceedsBalance(address from, uint8 id, uint32 amount);
    error LBToken__BurnExceedsBalance(address from, uint8 id, uint32 amount);

    event TransferBatch(
        address indexed sender, address indexed from, address indexed to, uint8[] ids, uint32[] amounts
    );

    event ApprovalForAll(address indexed account, address indexed sender, bool approved);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function totalSupply(uint8 id) external view returns (uint32);

    function balanceOf(address account, uint8 id) external view returns (uint32);

    function balanceOfBatch(address[] calldata accounts, uint8[] calldata ids)
        external
        view
        returns (uint32[] memory);

    function isApprovedForAll(address owner, address spender) external view returns (bool);

    function approveForAll(address spender, bool approved) external;

    function batchTransferFrom(address from, address to, uint8[] calldata ids, uint32[] calldata amounts) external;
}