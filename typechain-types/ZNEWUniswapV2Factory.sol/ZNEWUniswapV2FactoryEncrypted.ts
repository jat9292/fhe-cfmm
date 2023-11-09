/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface ZNEWUniswapV2FactoryEncryptedInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "addLiquidity"
      | "allPairs"
      | "allPairsLength"
      | "createPair"
      | "getPair"
      | "swap"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "PairCreated"): EventFragment;

  encodeFunctionData(
    functionFragment: "addLiquidity",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      BigNumberish[],
      BigNumberish[],
      AddressLike,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "allPairs",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "allPairsLength",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "createPair",
    values: [
      AddressLike,
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getPair",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "swap",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      AddressLike,
      BigNumberish
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "addLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "allPairs", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "allPairsLength",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "createPair", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getPair", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "swap", data: BytesLike): Result;
}

export namespace PairCreatedEvent {
  export type InputTuple = [
    token0: AddressLike,
    token1: AddressLike,
    pair: AddressLike,
    arg3: BigNumberish
  ];
  export type OutputTuple = [
    token0: string,
    token1: string,
    pair: string,
    arg3: bigint
  ];
  export interface OutputObject {
    token0: string;
    token1: string;
    pair: string;
    arg3: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ZNEWUniswapV2FactoryEncrypted extends BaseContract {
  connect(runner?: ContractRunner | null): ZNEWUniswapV2FactoryEncrypted;
  waitForDeployment(): Promise<this>;

  interface: ZNEWUniswapV2FactoryEncryptedInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  addLiquidity: TypedContractMethod<
    [
      tokenA: AddressLike,
      tokenB: AddressLike,
      amountAIn: BigNumberish,
      amountBIn: BigNumberish,
      liquidities: BigNumberish[],
      indexLiquidities: BigNumberish[],
      to: AddressLike,
      deadline: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  allPairs: TypedContractMethod<[arg0: BigNumberish], [string], "view">;

  allPairsLength: TypedContractMethod<[], [bigint], "view">;

  createPair: TypedContractMethod<
    [
      to: AddressLike,
      tokenA: AddressLike,
      tokenB: AddressLike,
      amountA: BigNumberish,
      amountB: BigNumberish,
      initialLiquidity: BigNumberish,
      initialActiveBin: BigNumberish
    ],
    [string],
    "nonpayable"
  >;

  getPair: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [string],
    "view"
  >;

  swap: TypedContractMethod<
    [
      tokenA: AddressLike,
      tokenB: AddressLike,
      amountAIn: BigNumberish,
      amountBIn: BigNumberish,
      to: AddressLike,
      deadline: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "addLiquidity"
  ): TypedContractMethod<
    [
      tokenA: AddressLike,
      tokenB: AddressLike,
      amountAIn: BigNumberish,
      amountBIn: BigNumberish,
      liquidities: BigNumberish[],
      indexLiquidities: BigNumberish[],
      to: AddressLike,
      deadline: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "allPairs"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "allPairsLength"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "createPair"
  ): TypedContractMethod<
    [
      to: AddressLike,
      tokenA: AddressLike,
      tokenB: AddressLike,
      amountA: BigNumberish,
      amountB: BigNumberish,
      initialLiquidity: BigNumberish,
      initialActiveBin: BigNumberish
    ],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getPair"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "swap"
  ): TypedContractMethod<
    [
      tokenA: AddressLike,
      tokenB: AddressLike,
      amountAIn: BigNumberish,
      amountBIn: BigNumberish,
      to: AddressLike,
      deadline: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "PairCreated"
  ): TypedContractEvent<
    PairCreatedEvent.InputTuple,
    PairCreatedEvent.OutputTuple,
    PairCreatedEvent.OutputObject
  >;

  filters: {
    "PairCreated(address,address,address,uint256)": TypedContractEvent<
      PairCreatedEvent.InputTuple,
      PairCreatedEvent.OutputTuple,
      PairCreatedEvent.OutputObject
    >;
    PairCreated: TypedContractEvent<
      PairCreatedEvent.InputTuple,
      PairCreatedEvent.OutputTuple,
      PairCreatedEvent.OutputObject
    >;
  };
}
