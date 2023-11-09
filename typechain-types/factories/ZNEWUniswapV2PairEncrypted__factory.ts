/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../common";
import type {
  ZNEWUniswapV2PairEncrypted,
  ZNEWUniswapV2PairEncryptedInterface,
} from "../ZNEWUniswapV2PairEncrypted";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "LBToken__AddressThisOrZero",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "id",
        type: "uint8",
      },
      {
        internalType: "uint32",
        name: "amount",
        type: "uint32",
      },
    ],
    name: "LBToken__BurnExceedsBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "LBToken__InvalidLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "LBToken__SelfApproval",
    type: "error",
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
        name: "spender",
        type: "address",
      },
    ],
    name: "LBToken__SpenderNotApproved",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "id",
        type: "uint8",
      },
      {
        internalType: "uint32",
        name: "amount",
        type: "uint32",
      },
    ],
    name: "LBToken__TransferExceedsBalance",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "Burn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "Swap",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint8[]",
        name: "ids",
        type: "uint8[]",
      },
      {
        indexed: false,
        internalType: "uint32[]",
        name: "amounts",
        type: "uint32[]",
      },
    ],
    name: "TransferBatch",
    type: "event",
  },
  {
    inputs: [],
    name: "MINIMUM_LIQUIDITY",
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
    inputs: [],
    name: "activeBin",
    outputs: [
      {
        internalType: "uint32",
        name: "amount0",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "amount1",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "activeBinIndex",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "approveForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "id",
        type: "uint8",
      },
    ],
    name: "balanceOf",
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
        internalType: "address[]",
        name: "accounts",
        type: "address[]",
      },
      {
        internalType: "uint8[]",
        name: "ids",
        type: "uint8[]",
      },
    ],
    name: "balanceOfBatch",
    outputs: [
      {
        internalType: "uint32[]",
        name: "batchBalances",
        type: "uint32[]",
      },
    ],
    stateMutability: "view",
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
        internalType: "uint8[]",
        name: "ids",
        type: "uint8[]",
      },
      {
        internalType: "uint32[]",
        name: "amounts",
        type: "uint32[]",
      },
    ],
    name: "batchTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getReserves",
    outputs: [
      {
        internalType: "uint32",
        name: "_reserve0",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_reserve1",
        type: "uint32",
      },
    ],
    stateMutability: "view",
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
        internalType: "address",
        name: "_token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "_token1",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "initialLiquidity",
        type: "uint32",
      },
      {
        internalType: "uint8",
        name: "initialActiveBin",
        type: "uint8",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
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
        internalType: "uint32[]",
        name: "liquidities",
        type: "uint32[]",
      },
      {
        internalType: "uint8[]",
        name: "indexLiquidities",
        type: "uint8[]",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
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
        name: "amount0",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "amount1",
        type: "uint32",
      },
    ],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token1",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "id",
        type: "uint8",
      },
    ],
    name: "totalSupply",
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
] as const;

const _bytecode =
  "0x60806040526003805460ff191690556005805460ff60e81b1916600160e81b179055600160075534801561003257600080fd5b5060038054610100600160a81b0319163361010002179055612485806100596000396000f3fe608060405234801561001057600080fd5b50600436106101365760003560e01c8063a5a3fbcb116100b2578063c45a015511610081578063e584b65411610066578063e584b6541461032a578063e919a82d1461033d578063e985e9c51461035057600080fd5b8063c45a0155146102ff578063d21220a71461031757600080fd5b8063a5a3fbcb146102a1578063a625f787146102b4578063ba9a7a56146102d0578063c14cfd6e146102d957600080fd5b80633e84b8e11161010957806367412045116100ee578063674120451461025c57806395d89b411461026f578063a2ba5c8d1461028e57600080fd5b80633e84b8e1146101fe578063496d9f441461021e57600080fd5b8063025897c11461013b57806306fdde03146101505780630902f1ac1461019b5780630dfe1681146101d3575b600080fd5b61014e610149366004611c40565b610373565b005b60408051808201909152601481527f4c697175696469747920426f6f6b20546f6b656e00000000000000000000000060208201525b6040516101929190611c89565b60405180910390f35b60055463ffffffff600160a01b8204811691600160c01b9004165b6040805163ffffffff938416815292909116602083015201610192565b6004546101e6906001600160a01b031681565b6040516001600160a01b039091168152602001610192565b61021161020c366004611d23565b610a9c565b6040516101929190611d8f565b61024761022c366004611dea565b60ff1660009081526001602052604090205463ffffffff1690565b60405163ffffffff9091168152602001610192565b61024761026a366004611e05565b610b9b565b60408051808201909152600381526213109560ea1b6020820152610185565b61014e61029c366004611e38565b610bcd565b61014e6102af366004611ec9565b610c21565b6006546101b69063ffffffff8082169164010000000090041682565b61024761271081565b6005546102ed90600160e01b900460ff1681565b60405160ff9091168152602001610192565b6003546101e69061010090046001600160a01b031681565b6005546101e6906001600160a01b031681565b61014e610338366004611f30565b610da0565b61014e61034b366004612049565b610daf565b61036361035e36600461211d565b6117f0565b6040519015158152602001610192565b6007546001146103ca5760405162461bcd60e51b815260206004820152601160248201527f556e697377617056323a204c4f434b454400000000000000000000000000000060448201526064015b60405180910390fd5b600060075560035461010090046001600160a01b031633146104425760405162461bcd60e51b815260206004820152602b60248201527f556e697377617056323a2043616c6c6572206973206e6f742074686520726f7560448201526a7465722f666163746f727960a81b60648201526084016103c1565b63ffffffff821615801561045b575063ffffffff811615155b8061047a575063ffffffff82161580159061047a575063ffffffff8116155b6104ec5760405162461bcd60e51b815260206004820152602f60248201527f45786163746c79206f6e65206f662074686520696e707574656420616d6f756e60448201527f7473206d757374206265206e756c6c000000000000000000000000000000000060648201526084016103c1565b63ffffffff8216158015906000908190610799575b600060648661051e6005601c9054906101000a900460ff16611803565b610528919061215d565b610532919061219b565b60065490915063ffffffff6401000000009091048116908216116106505761055a81836121be565b60068054919350829160049061057f908490640100000000900463ffffffff166121e2565b92506101000a81548163ffffffff021916908363ffffffff16021790555085600660000160008282829054906101000a900463ffffffff166105c191906121be565b82546101009290920a63ffffffff8181021990931691831602179091556005546040516320025d2160e21b81526001600160a01b038b81166004830152928616602482015260009950911691506380097484906044015b600060405180830381600087803b15801561063257600080fd5b505af1158015610646573d6000803e3d6000fd5b5050505050610a59565b60065460055460009163ffffffff169061067390600160e01b900460ff16611803565b600554600160e01b900460ff1660009081526001602052604090205463ffffffff1661069f919061219b565b6106a991906121e2565b905060646106c56005601c9054906101000a900460ff16611803565b6106cf908361215d565b6106d9919061219b565b6106e390846121be565b92506106ef81886121e2565b965060016005601c8282829054906101000a900460ff1661071091906121ff565b92506101000a81548160ff021916908360ff16021790555060646107586005601c9054906101000a900460ff1660ff1660009081526001602052604090205463ffffffff1690565b610762919061219b565b6006805467ffffffffffffffff191664010000000063ffffffff939093169290920263ffffffff1916919091179055506105019050565b6005546000906107b290600160e01b900460ff16611803565b6107bd86606461215d565b6107c7919061219b565b60065490915063ffffffff908116908216116108a3576107e781846121be565b60068054919450829160009061080490849063ffffffff166121e2565b92506101000a81548163ffffffff021916908363ffffffff16021790555084600660000160048282829054906101000a900463ffffffff1661084691906121be565b82546101009290920a63ffffffff818102199093169183160217909155600480546040516320025d2160e21b81526001600160a01b038c811693820193909352928716602484015260009850169150638009748490604401610618565b600654600554600160e01b900460ff166000908152600160205260408120549091640100000000900463ffffffff90811691606491166108e3919061219b565b6108ed91906121e2565b60055490915061090690600160e01b900460ff16611803565b61091182606461215d565b61091b919061219b565b61092590856121be565b935061093181876121e2565b955060016005601c8282829054906101000a900460ff166109529190612218565b92506101000a81548160ff021916908360ff16021790555060156005601c9054906101000a900460ff1660ff16106109f25760405162461bcd60e51b815260206004820152602560248201527f537761702072656a65637465642c20696e73756666696369656e74206c69717560448201527f696469747900000000000000000000000000000000000000000000000000000060648201526084016103c1565b600554610a0890600160e01b900460ff16611803565b600554600160e01b900460ff1660009081526001602052604090205463ffffffff16610a34919061219b565b6006805467ffffffffffffffff191663ffffffff929092169190911790555050610799565b6040516001600160a01b0387169033907fe1d4504fa5e661f80f16e8d613b5bc290ee6afe00a96b833a972d8e4490976e190600090a35050600160075550505050565b60608382808214610ac0576040516340311ffd60e11b815260040160405180910390fd5b8567ffffffffffffffff811115610ad957610ad9611f6c565b604051908082528060200260200182016040528015610b02578160200160208202803683370190505b50925060005b86811015610b9057610b61888883818110610b2557610b25612231565b9050602002016020810190610b3a9190612247565b878784818110610b4c57610b4c612231565b905060200201602081019061026a9190611dea565b848281518110610b7357610b73612231565b63ffffffff90921660209283029190910190910152600101610b08565b505050949350505050565b6001600160a01b03821660009081526020818152604080832060ff8516845290915290205463ffffffff165b92915050565b8533610bd98282611848565b610c095760405163548f773d60e01b81526001600160a01b038084166004830152821660248201526044016103c1565b610c17888888888888611894565b5050505050505050565b60035461010090046001600160a01b03163314610c805760405162461bcd60e51b815260206004820152601460248201527f556e697377617056323a20464f5242494444454e00000000000000000000000060448201526064016103c1565b600480547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0386811691909117909155600580549185167fffffff00ffffffffffffffff000000000000000000000000000000000000000090921691909117600160e01b60ff841602179055604080516001808252818301909252600091602080830190803683370190505090508281600081518110610d2a57610d2a612231565b63ffffffff92909216602092830291909101909101526040805160018082528183019092526000918160200160208202803683370190505090508281600081518110610d7857610d78612231565b602002602001019060ff16908160ff1681525050610d97878383610daf565b50505050505050565b610dab338383611a9d565b5050565b600754600114610e015760405162461bcd60e51b815260206004820152601160248201527f556e697377617056323a204c4f434b454400000000000000000000000000000060448201526064016103c1565b600060075560035461010090046001600160a01b03163314610e795760405162461bcd60e51b815260206004820152602b60248201527f556e697377617056323a2043616c6c6572206973206e6f742074686520726f7560448201526a7465722f666163746f727960a81b60648201526084016103c1565b8151815114610f165760405162461bcd60e51b815260206004820152604760248201527f4c656e677468206d69736d61746368206265747765656e2074686520696e646560448201527f784c6971756964697469657320616e6420746865206c6971756964697469657360648201527f2061727261797300000000000000000000000000000000000000000000000000608482015260a4016103c1565b600080610f3a60055463ffffffff600160a01b8204811692600160c01b9092041690565b915091506000806000600460009054906101000a90046001600160a01b03166001600160a01b0316632e1101816040518163ffffffff1660e01b8152600401602060405180830381865afa158015610f96573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fba9190612262565b90506000600560009054906101000a90046001600160a01b03166001600160a01b0316632e1101816040518163ffffffff1660e01b8152600401602060405180830381865afa158015611011573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906110359190612262565b905061104186836121e2565b935061104d85826121e2565b9250505060005b85518160ff161015611573576000868260ff168151811061107757611077612231565b6020026020010151905060158160ff16106111055760405162461bcd60e51b815260206004820152604260248201527f496e646578206d757374206265206265747765656e203020616e64203230206960448201527f6e637573697665202d20696e6465782031302069732070617269747920707269606482015261636560f01b608482015260a4016103c1565b60055460ff600160e01b90910481169082161015611213576064888360ff168151811061113457611134612231565b6020026020010151611146919061219b565b6111519060016121be565b63ffffffff168363ffffffff1610156111ac5760405162461bcd60e51b815260206004820152601660248201527f4e6f7420656e6f75676820746f6b656e312073656e740000000000000000000060448201526064016103c1565b6064888360ff16815181106111c3576111c3612231565b60200260200101516111d5919061219b565b6111e09060016121be565b6111ea90846121e2565b925061121389828a8560ff168151811061120657611206612231565b6020026020010151611b85565b60055460ff600160e01b909104811690821611156113225761123481611803565b888360ff168151811061124957611249612231565b602002602001015161125b919061219b565b6112669060016121be565b63ffffffff168463ffffffff1610156112c15760405162461bcd60e51b815260206004820152601660248201527f4e6f7420656e6f75676820746f6b656e302073656e740000000000000000000060448201526064016103c1565b6112ca81611803565b888360ff16815181106112df576112df612231565b60200260200101516112f1919061219b565b6112fc9060016121be565b61130690856121e2565b935061132289828a8560ff168151811061120657611206612231565b60055460ff600160e01b9091048116908216036115605760035460ff1680611374575061271063ffffffff16888360ff168151811061136357611363612231565b602002602001015163ffffffff1610155b6113c05760405162461bcd60e51b815260206004820152601d60248201527f4e6f7420656e6f756768206c69717569646974792070726f766964656400000060448201526064016103c1565b60006113cb82611803565b60028a8560ff16815181106113e2576113e2612231565b60200260200101516113f4919061219b565b6113fe919061219b565b6114099060016121be565b90506000606460028b8660ff168151811061142657611426612231565b6020026020010151611438919061219b565b611442919061219b565b61144d9060016121be565b905061145982876121e2565b955061146581866121e2565b60035490955060ff16156114925761148d8b848c8760ff168151811061120657611206612231565b6114e2565b6114c68b846127108d8860ff16815181106114af576114af612231565b60200260200101516114c191906121e2565b611b85565b6114d4600084612710611b85565b6003805460ff191660011790555b600680548391906000906114fd90849063ffffffff166121be565b92506101000a81548163ffffffff021916908363ffffffff16021790555080600660000160048282829054906101000a900463ffffffff1661153f91906121be565b92506101000a81548163ffffffff021916908363ffffffff16021790555050505b508061156b8161227f565b915050611054565b50600480546040516320025d2160e21b81526001600160a01b038a81169382019390935263ffffffff85166024820152911690638009748490604401600060405180830381600087803b1580156115c957600080fd5b505af11580156115dd573d6000803e3d6000fd5b50506005546040516320025d2160e21b81526001600160a01b038b8116600483015263ffffffff86166024830152909116925063800974849150604401600060405180830381600087803b15801561163457600080fd5b505af1158015611648573d6000803e3d6000fd5b505050506000600460009054906101000a90046001600160a01b03166001600160a01b0316632e1101816040518163ffffffff1660e01b8152600401602060405180830381865afa1580156116a1573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116c59190612262565b90506000600560009054906101000a90046001600160a01b03166001600160a01b0316632e1101816040518163ffffffff1660e01b8152600401602060405180830381865afa15801561171c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906117409190612262565b600580547fffffffff0000000000000000ffffffffffffffffffffffffffffffffffffffff16600160a01b63ffffffff958616027fffffffff00000000ffffffffffffffffffffffffffffffffffffffffffffffff1617600160c01b929094169190910292909217909155506040516001600160a01b0388169033907fc5004d0de103a4ce335ec7dfbb178f69e81ecd773d402c331dafc66c465a020a90600090a3505060016007555050505050565b60006117fc8383611848565b9392505050565b600060036009611814846004612382565b61181f856005612382565b61182a906064612391565b61183491906123a8565b61183e91906123a8565b610bc791906123bc565b6000816001600160a01b0316836001600160a01b031614806117fc5750506001600160a01b03918216600090815260026020908152604080832093909416825291909152205460ff1690565b82818082146118b6576040516340311ffd60e11b815260040160405180910390fd5b866001600160a01b03811615806118d557506001600160a01b03811630145b156118f3576040516345c210e760e11b815260040160405180910390fd5b6001600160a01b03808a16600090815260208190526040808220928b1682528120905b60ff8116891115611a345760008a8a8360ff1681811061193857611938612231565b905060200201602081019061194d9190611dea565b9050600089898460ff1681811061196657611966612231565b905060200201602081019061197b91906123cf565b60ff831660009081526020879052604090205490915063ffffffff9081169082168110156119e7578e83836040516334bffbd560e21b81526004016103c1939291906001600160a01b0393909316835260ff91909116602083015263ffffffff16604082015260600190565b60ff909216600090815260208681526040808320805463ffffffff96869003871663ffffffff19918216179091559187905290912080548085169093019093169116179055600101611916565b50896001600160a01b03168b6001600160a01b0316336001600160a01b03167f0beab098a6eae51e213f413d756737845804389284cb525a06ee249e70f98be08c8c8c8c604051611a8894939291906123ec565b60405180910390a45050505050505050505050565b826001600160a01b0381161580611abc57506001600160a01b03811630145b15611ada576040516345c210e760e11b815260040160405180910390fd5b826001600160a01b0316846001600160a01b031603611b175760405163782ee70760e01b81526001600160a01b03851660048201526024016103c1565b6001600160a01b03848116600081815260026020908152604080832094881680845294825291829020805460ff191687151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a350505050565b60ff821660009081526001602052604081208054839290611bad90849063ffffffff166121be565b82546101009290920a63ffffffff8181021990931691831602179091556001600160a01b039490941660009081526020818152604080832060ff96909616835294905292909220805463ffffffff198116908516929092019093161790915550565b80356001600160a01b0381168114611c2657600080fd5b919050565b63ffffffff81168114611c3d57600080fd5b50565b600080600060608486031215611c5557600080fd5b611c5e84611c0f565b92506020840135611c6e81611c2b565b91506040840135611c7e81611c2b565b809150509250925092565b600060208083528351808285015260005b81811015611cb657858101830151858201604001528201611c9a565b506000604082860101526040601f19601f8301168501019250505092915050565b60008083601f840112611ce957600080fd5b50813567ffffffffffffffff811115611d0157600080fd5b6020830191508360208260051b8501011115611d1c57600080fd5b9250929050565b60008060008060408587031215611d3957600080fd5b843567ffffffffffffffff80821115611d5157600080fd5b611d5d88838901611cd7565b90965094506020870135915080821115611d7657600080fd5b50611d8387828801611cd7565b95989497509550505050565b6020808252825182820181905260009190848201906040850190845b81811015611dcd57835163ffffffff1683529284019291840191600101611dab565b50909695505050505050565b803560ff81168114611c2657600080fd5b600060208284031215611dfc57600080fd5b6117fc82611dd9565b60008060408385031215611e1857600080fd5b611e2183611c0f565b9150611e2f60208401611dd9565b90509250929050565b60008060008060008060808789031215611e5157600080fd5b611e5a87611c0f565b9550611e6860208801611c0f565b9450604087013567ffffffffffffffff80821115611e8557600080fd5b611e918a838b01611cd7565b90965094506060890135915080821115611eaa57600080fd5b50611eb789828a01611cd7565b979a9699509497509295939492505050565b600080600080600060a08688031215611ee157600080fd5b611eea86611c0f565b9450611ef860208701611c0f565b9350611f0660408701611c0f565b92506060860135611f1681611c2b565b9150611f2460808701611dd9565b90509295509295909350565b60008060408385031215611f4357600080fd5b611f4c83611c0f565b915060208301358015158114611f6157600080fd5b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715611fab57611fab611f6c565b604052919050565b600067ffffffffffffffff821115611fcd57611fcd611f6c565b5060051b60200190565b600082601f830112611fe857600080fd5b81356020611ffd611ff883611fb3565b611f82565b82815260059290921b8401810191818101908684111561201c57600080fd5b8286015b8481101561203e5761203181611dd9565b8352918301918301612020565b509695505050505050565b60008060006060848603121561205e57600080fd5b61206784611c0f565b925060208085013567ffffffffffffffff8082111561208557600080fd5b818701915087601f83011261209957600080fd5b81356120a7611ff882611fb3565b81815260059190911b8301840190848101908a8311156120c657600080fd5b938501935b828510156120ed5784356120de81611c2b565b825293850193908501906120cb565b96505050604087013592508083111561210557600080fd5b505061211386828701611fd7565b9150509250925092565b6000806040838503121561213057600080fd5b61213983611c0f565b9150611e2f60208401611c0f565b634e487b7160e01b600052601160045260246000fd5b63ffffffff81811683821602808216919082811461217d5761217d612147565b505092915050565b634e487b7160e01b600052601260045260246000fd5b600063ffffffff808416806121b2576121b2612185565b92169190910492915050565b63ffffffff8181168382160190808211156121db576121db612147565b5092915050565b63ffffffff8281168282160390808211156121db576121db612147565b60ff8281168282160390811115610bc757610bc7612147565b60ff8181168382160190811115610bc757610bc7612147565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561225957600080fd5b6117fc82611c0f565b60006020828403121561227457600080fd5b81516117fc81611c2b565b600060ff821660ff810361229557612295612147565b60010192915050565b600181815b808511156122d95781600019048211156122bf576122bf612147565b808516156122cc57918102915b93841c93908002906122a3565b509250929050565b6000826122f057506001610bc7565b816122fd57506000610bc7565b8160018114612313576002811461231d57612339565b6001915050610bc7565b60ff84111561232e5761232e612147565b50506001821b610bc7565b5060208310610133831016604e8410600b841016171561235c575081810a610bc7565b612366838361229e565b806000190482111561237a5761237a612147565b029392505050565b60006117fc60ff8416836122e1565b8082028115828204841417610bc757610bc7612147565b6000826123b7576123b7612185565b500490565b81810381811115610bc757610bc7612147565b6000602082840312156123e157600080fd5b81356117fc81611c2b565b6040808252810184905260008560608301825b878110156124275760ff61241284611dd9565b168252602092830192909101906001016123ff565b5083810360208581019190915285825291508590820160005b8681101561246b57823561245381611c2b565b63ffffffff1682529183019190830190600101612440565b509897505050505050505056fea164736f6c6343000813000a";

type ZNEWUniswapV2PairEncryptedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ZNEWUniswapV2PairEncryptedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ZNEWUniswapV2PairEncrypted__factory extends ContractFactory {
  constructor(...args: ZNEWUniswapV2PairEncryptedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      ZNEWUniswapV2PairEncrypted & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): ZNEWUniswapV2PairEncrypted__factory {
    return super.connect(runner) as ZNEWUniswapV2PairEncrypted__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ZNEWUniswapV2PairEncryptedInterface {
    return new Interface(_abi) as ZNEWUniswapV2PairEncryptedInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ZNEWUniswapV2PairEncrypted {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as ZNEWUniswapV2PairEncrypted;
  }
}
