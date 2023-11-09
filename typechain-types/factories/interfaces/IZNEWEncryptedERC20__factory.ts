/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IZNEWEncryptedERC20,
  IZNEWEncryptedERC20Interface,
} from "../../interfaces/IZNEWEncryptedERC20";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "amount",
        type: "uint32",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "balanceOfMeUnprotected",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "encryptedAmount",
        type: "uint32",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "encryptedAmount",
        type: "uint32",
      },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "encryptedAmount",
        type: "uint32",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IZNEWEncryptedERC20__factory {
  static readonly abi = _abi;
  static createInterface(): IZNEWEncryptedERC20Interface {
    return new Interface(_abi) as IZNEWEncryptedERC20Interface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IZNEWEncryptedERC20 {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as IZNEWEncryptedERC20;
  }
}
