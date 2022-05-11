import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

import {
  INetworksContractMap,
  NetworksContractsRegistry,
} from './contractRegistry';
import { NetworkID, ProvidersRegistry } from './providersRegistry';
import {
  ContractVersions,
  IContractsRegistry,
  SimpleContract,
} from './Contract';
import {Contract, ContractCall, Provider as MultiCallProvider} from "@hovoh/ethers-multicall";

export class ContractFactory<T extends INetworksContractMap<T>> {
  public readonly providers: ProvidersRegistry;
  private contracts: NetworksContractsRegistry<T>;

  constructor(
    providersRegistry: ProvidersRegistry,
    contractsRegistry: NetworksContractsRegistry<T>
  ) {
    this.providers = providersRegistry;
    this.contracts = contractsRegistry as NetworksContractsRegistry<T>;
  }

  public forNetwork<K extends keyof T>(
    network: K,
    provider?: Provider | Signer | null
  ) {
    const nid = network as NetworkID;
    if (!this.providers.networkAvailable(nid) && !provider) {
      throw Error(`Network ${network} is not available`);
    }
    const networkProvider = provider || this.providers.forNetwork(nid);
    const contracts = this.contracts.forNetwork(network);
    if (contracts) {
      return new NetworkContractFactory<T[K]>(
        networkProvider,
        nid as number,
        contracts as T[K]
      ) as IContractFactory<T[K]>;
    }
    return new NetworkContractFactory<T[K]>(networkProvider, nid as number, {} as T[K]) as IContractFactory<T[K]>;
  }
}

export interface IContractFactory<T extends IContractsRegistry<keyof T>> {
  networkProvider: Provider | Signer;
  chainId: number;

  multiCall<K extends keyof T, T1, T2>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => [ContractCall<T1>, ContractCall<T2>]): Promise<[T1, T2]>
  multiCall<K extends keyof T, T1, T2, T3>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => [ContractCall<T1>, ContractCall<T2>, ContractCall<T3>]): Promise<[T1, T2, T3]>
  multiCall<K extends keyof T, T1, T2, T3, T4>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => [ContractCall<T1>, ContractCall<T2>, ContractCall<T3>, ContractCall<T4>]): Promise<[T1, T2, T3, T4]>
  multiCall<K extends keyof T, T1, T2, T3, T4, T5>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => [ContractCall<T1>, ContractCall<T2>, ContractCall<T3>, ContractCall<T4>, ContractCall<T5>]): Promise<[T1, T2, T3, T4, T5]>
  multiCall<K extends keyof T, T1, T2, T3, T4, T5, T6>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => [ContractCall<T1>, ContractCall<T2>, ContractCall<T3>, ContractCall<T4>, ContractCall<T5>, ContractCall<T6>]): Promise<[T1, T2, T3, T4, T5, T6]>
  multiCall<K extends keyof T, T1, T2, T3, T4, T5, T6, T7>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => [ContractCall<T1>, ContractCall<T2>, ContractCall<T3>, ContractCall<T4>, ContractCall<T5>, ContractCall<T6>, ContractCall<T7>]): Promise<[T1, T2, T3, T4, T5, T6, T7]>
  multiCall<K extends keyof T, T1, T2, T3, T4, T5, T6, T7, T8>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => [ContractCall<T1>, ContractCall<T2>, ContractCall<T3>, ContractCall<T4>, ContractCall<T5>, ContractCall<T6>, ContractCall<T7>, ContractCall<T8>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8]>
  multiCall<K extends keyof T, T1, T2, T3, T4, T5, T6, T7, T8, T9>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => [ContractCall<T1>, ContractCall<T2>, ContractCall<T3>, ContractCall<T4>, ContractCall<T5>, ContractCall<T6>, ContractCall<T7>, ContractCall<T8>, ContractCall<T9>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>
  multiCall<K extends keyof T>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => ContractCall<any>[]): Promise<any[]>
  getContractVersions<K extends keyof T>(contractName: K):ContractVersions<ReturnType<T[K]['factory']>, ReturnType<T[K]['multicallFactory']>>
  getContractAtBlock<K extends keyof T>(
      contractName: K,
      atBlock: number
  ): SimpleContract<ReturnType<T[K]['factory']>, ReturnType<T[K]['multicallFactory']>>
  getContract<K extends keyof T>(contractName: K, version: number): SimpleContract<ReturnType<T[K]['factory']>, ReturnType<T[K]['multicallFactory']>>
  getLatestContract<K extends keyof T>(contractName: K): SimpleContract<ReturnType<T[K]['factory']>, ReturnType<T[K]['multicallFactory']>>
  getLatestContractInstance<K extends keyof T>(contractName: K): ReturnType<T[K]['factory']> & { multiCall: ReturnType<T[K]['multicallFactory']>}
  getContractInstanceAtBlock<K extends keyof T>(
      contractName: K,
      blockNumber: number
  ): ReturnType<T[K]['factory']> & { multiCall: ReturnType<T[K]['multicallFactory']>}
}


// T is name => ContractVersion<FactoryType>
export class NetworkContractFactory<T extends IContractsRegistry<keyof T>> {
  public readonly networkProvider: Provider | Signer;
  private readonly contracts: IContractsRegistry<keyof T>;
  public readonly chainId: number;

  constructor(provider: Provider | Signer, chainId: number, contractsRegistry: T) {
    this.networkProvider = provider;
    this.contracts = contractsRegistry;
    this.chainId = chainId;
  }

  public getContractVersions<K extends keyof T>(contractName: K) {
    return this.contracts[contractName] as ContractVersions<ReturnType<T[K]['factory']>, ReturnType<T[K]['multicallFactory']>>;
  }

  public getContractAtBlock<K extends keyof T>(
      contractName: K,
      atBlock: number
  ) {
    return this.contracts[contractName].atBlock(atBlock) as SimpleContract<ReturnType<T[K]['factory']>, ReturnType<T[K]['multicallFactory']>>;
  }

  public getContract<K extends keyof T>(contractName: K, version: number) {
    return this.getContractVersions(contractName).getVersion(
        version
    ) as SimpleContract<ReturnType<T[K]['factory']>, ReturnType<T[K]['multicallFactory']>>;
  }

  public getLatestContract<K extends keyof T>(contractName: K) {
    const contract = this.getContractVersions(contractName).latest();
    return contract as SimpleContract<ReturnType<T[K]['factory']>, ReturnType<T[K]['multicallFactory']>>;
  }

  public getLatestContractInstance<K extends keyof T>(contractName: K) {
    const contract = this.getLatestContract(contractName);
    return this.instanciateContract(contract);
  }

  public getContractInstanceAtBlock<K extends keyof T>(
      contractName: K,
      blockNumber: number
  ) {
    const contract = this.getContractAtBlock(
        contractName,
        blockNumber
    );
    return this.instanciateContract(contract);
  }

  private instanciateContract<T, U>(contract: SimpleContract<T, U>) {
    const instance = contract.factory(contract.address, this.networkProvider) as { multiCall: U } & T;
    instance.multiCall = this.multiCallInstance(contract);
    return instance;
  }

  public multiCallInstance<T>(contract: SimpleContract<any, T>) {
    return contract.multicallFactory(contract.address);
  }

  public multiCall<K extends keyof T>(calls: (get: (contractName: K) => ReturnType<T[K]['multicallFactory']>) => ContractCall<any>[]) {
    const getMultiCall = (contractName: K) => this.multiCallInstance(this.getLatestContract(contractName));
    return new MultiCallProvider(this.networkProvider as Provider, this.chainId).all(calls(getMultiCall));
  }
}

